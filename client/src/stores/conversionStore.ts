import { toResourceUrl } from "$lib/utils";
import { get, writable } from "svelte/store";
import { FileType, Upscaler, Status, type StatusUpdate } from "$common/types/Files"
import type { LocalSettings, SerializedConversionFile, Stats, BaseSettings } from "$common/types/Files"

export type ConversionDiff = {
    original: ConversionFile
    converted: string
}

export class ConversionFile {
    id: string
    file: File
    finalName: string
    status: StatusUpdate = {
        status: Status.Idle
    }
    stats: Stats = {
        size: 0,
        width: 0,
        height: 0,
    }
    private obj: string | null = null

    settings: LocalSettings = {
        type: FileType.Unknown,
        upscaler: Upscaler.Waifu2x,
    }

    constructor(file: File, settings?: LocalSettings, stats?: Stats) {
        this.file = file
        this.id = `${Math.random().toString(36).substring(2, 9)}-${file.name}`
        this.stats = stats ?? this.stats
        this.finalName = file.name
        this.settings = settings ?? this.settings
    }

    static async getFileStats(file: File, type: FileType): Promise<Stats> {
        return new Promise((res, rej) => {
            if ([FileType.Gif, FileType.Webp, FileType.Image].includes(type)) {
                const img = new Image()
                img.src = toResourceUrl(file.path)
                img.onload = () => {
                    const stats = {
                        size: file.size,
                        width: img.width,
                        height: img.height,
                    }
                    res(stats)
                }
            } else if (type === FileType.Video) {
                const video = document.createElement("video")
                video.src = toResourceUrl(file.path)
                video.addEventListener("loadedmetadata", () => {
                    const stats = {
                        size: file.size,
                        width: video.videoWidth,
                        height: video.videoHeight,
                    }
                    res(stats)
                })
            } else {
                res({
                    size: file.size,
                    width: 0,
                    height: 0,
                })
            }
        })

    }
    static async from(file: File): Promise<ConversionFile> {
        const type = await getFileType(file)
        const stats = await ConversionFile.getFileStats(file, type)
        const baseSettings: LocalSettings = {
            type
        }
        return new ConversionFile(file, baseSettings, stats)
    }
    getType(): FileType {
        return this.settings.type
    }
    serialize(): SerializedConversionFile {
        return {
            id: this.id,
            finalName: this.finalName,
            status: this.status,
            settings: this.settings,
            stats: this.stats,
            path: this.file.path,
        }
    }
    disposeObjectUrl() {
        if (!this.obj) return
        URL.revokeObjectURL(this.obj)
        this.obj = null
    }

}

async function getFileType(file: File): Promise<FileType> {
    const [type, subtype] = file.type.split("/")
    if (type === "image") {
        if (subtype === "gif") return FileType.Gif
        if (subtype === "webp") {
            const buffer = await file.arrayBuffer()
            return isAnimatedWebp(buffer) ? FileType.WebpAnimated : FileType.Webp
        }
        return FileType.Image
    }
    if (type === "video") return FileType.Video
    return FileType.Unknown
}
function isAnimatedWebp(buffer: ArrayBuffer) {
    const header = String.fromCharCode(...new Uint8Array(buffer, 0, 60))
    return header.includes("ANIM")
}


interface ConversionStore {
    files: ConversionFile[]
}

function createConversionsStore() {
    const { subscribe, set, update } = writable<ConversionStore>({
        files: [],
    });
    let current = get({ subscribe })
    subscribe(value => current = value)
    async function add(...files: File[]) {
        const parsed = await Promise.all(files.map(file => ConversionFile.from(file)))
        update(state => {
            state.files.push(...parsed)
            return state
        })
    }
    function remove(idOrFile: string | ConversionFile) {
        update(state => {
            const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
            state.files = state.files.filter(file => file.id !== id)
            return state
        })
    }
    function updateStatus(idOrFile: string | ConversionFile, statusUpdate: StatusUpdate) {
        update(state => {
            const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
            const file = state.files.find(file => file.id === id)
            if (!file) return state
            file.status = statusUpdate
            return state
        })
    }
    function getNextValid(idOrFile: string | ConversionFile, direction: "next" | "previous" = "next") {
        const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
        const currentIndex = current.files.findIndex(file => file.id === id)
        if (currentIndex === -1) return null
        if (direction === "next") {
            return current.files.slice(currentIndex + 1).find(file => file.status.status === Status.Done)
        } else {
            return current.files.slice(0, currentIndex).reverse().find(file => file.status.status === Status.Done)
        }
    }
    return {
        subscribe,
        add,
        remove,
        updateStatus,
        getNextValid,
    }
}


export const conversionsStore = createConversionsStore();