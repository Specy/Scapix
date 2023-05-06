import { toResourceUrl } from "$lib/utils";
import { get, writable } from "svelte/store";
import { type FileTypes, Status, type StatusUpdate } from "$common/types/Files"
import type { SerializedConversionFile, Stats, UpscalerName, OptionalUpscaleSettings } from "$common/types/Files"
import { schemaStore } from "./schemaStore";

export type ConversionDiff = {
    original: ConversionFile<FileTypes>
    converted: string
}


export class ConversionFile<F extends FileTypes> {
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
    settings: OptionalUpscaleSettings
    constructor(file: File,type: FileTypes, stats?: Stats, defaultSettingsValues?: OptionalUpscaleSettings['opts']['values']) {
        this.file = file
        this.id = `${Math.random().toString(36).substring(2, 9)}-${file.name}`
        this.stats = stats ?? this.stats
        this.finalName = file.name
        this.settings = {
            upscaler: undefined,
            opts: {
                type,
                values: defaultSettingsValues ?? {}
            }
        }
    }

    static async getFileStats(file: File, type: FileTypes): Promise<Stats> {
        return new Promise((res, rej) => {
            if (["gif", "webp", "image"].includes(type)) {
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
            } else if (type === "video") {
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
    static async from(file: File): Promise<ConversionFile<FileTypes>> {
        const type = await getFileType(file)
        if (!type) throw new Error("Unsupported file type")
        const stats = await ConversionFile.getFileStats(file, type)
        return new ConversionFile(file, type, stats)
    }
    setUpscaler(upscaler: UpscalerName | undefined) {   
        this.settings.upscaler = upscaler
        if(!upscaler) return
        const defaults = schemaStore.getDefaultOfType(upscaler, this.getType())
        if (!defaults) return
        this.settings.opts.values = defaults
    }
    getType(): F {
        return this.settings.opts.type as F
    }
    serialize(): SerializedConversionFile {
        return {
            id: this.id,
            finalName: this.finalName,
            status: this.status,
            settings: this.settings,
            stats: this.stats,
            path: this.file.path,
            type: this.getType()
        }
    }
    disposeObjectUrl() {
        if (!this.obj) return
        URL.revokeObjectURL(this.obj)
        this.obj = null
    }

}

async function getFileType(file: File): Promise<FileTypes | null> {
    const [type, subtype] = file.type.split("/")
    if (type === "image") {
        if (subtype === "gif") return "gif"
        if (subtype === "webp") {
            const buffer = await file.arrayBuffer()
            return isAnimatedWebp(buffer) ? "webpAnimated" : "webp"
        }
        return "image"
    }
    if (type === "video") return "video"
    return null
}
//https://developers.google.com/speed/webp/docs/riff_container#extended_file_format
function isAnimatedWebp(buffer: ArrayBuffer) { //not the most accurate way to check, but it works
    const header = String.fromCharCode(...new Uint8Array(buffer, 0, 256))
    return header.includes("ANIM")
}


interface ConversionStore {
    files: ConversionFile<FileTypes>[]
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
    function remove(idOrFile: string | ConversionFile<FileTypes>) {
        update(state => {
            const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
            state.files = state.files.filter(file => file.id !== id)
            return state
        })
    }
    function updateStatus(idOrFile: string | ConversionFile<FileTypes>, statusUpdate: StatusUpdate) {
        update(state => {
            const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
            const file = state.files.find(file => file.id === id)
            if (!file) return state
            file.status = statusUpdate
            return state
        })
    }
    function getNextValid(idOrFile: string | ConversionFile<FileTypes>, direction: "next" | "previous" = "next") {
        const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
        const currentIndex = current.files.findIndex(file => file.id === id)
        if (currentIndex === -1) return undefined
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