import { toResourceUrl } from "$lib/utils";
import { writable } from "svelte/store";


export enum FileType {
    Image = "image",
    Video = "video",
    Gif = "gif",
    Webp = "webp",
    Unknown = "unknown"
}

export enum Upscaler {
    Waifu2x = "waifu2x",
    RealESRGAN = "real-esrgan",
}

export enum Status {
    Waiting = "waiting",
    Converting = "converting",
    Done = "done",
    Error = "error"
}

export enum DenoiseLevel {
    None = "none",
    Low = "low",
    Medium = "medium",
    High = "high",
}
export enum ImageType {
    Drawing = "drawing",
    Photo = "photo",
}

export type GlobalSettings = {
    scale: number
    denoise: DenoiseLevel
    imageType: ImageType
}

export type BaseSettings = {
    scale?: number
    denoise?: 0 | 1 | 2 | 3
    upscaler?: Upscaler
}

export type LocalSettings = BaseSettings & ({
    type: FileType.Gif
    quality: number
    speed: number
    cumulative: boolean
} | {
    type: FileType.Image
} | {
    type: FileType.Video
    framerate: number
    quality: number
    speed: number
} | {
    type: FileType.Webp
    quality: number
    speed: number
} | {
    type: FileType.Unknown
})

type Stats = {
    size: number
    width: number
    height: number
}
export class ConversionFile {
    id: string
    file: File
    finalName: string
    status: Status = Status.Waiting
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
        const type = getFileType(file)
        const stats = await ConversionFile.getFileStats(file, type)
        return new ConversionFile(file, getDefaultSettings(type), stats)
    }
    getType(): FileType {
        return this.settings.type
    }

    disposeObjectUrl() {
        if (!this.obj) return
        URL.revokeObjectURL(this.obj)
        this.obj = null
    }

}

function getFileType(file: File): FileType {
    const [type, subtype] = file.type.split("/")
    if (type === "image") {
        if (subtype === "gif") return FileType.Gif
        if (subtype === "webp") return FileType.Webp
        return FileType.Image
    }
    if (type === "video") return FileType.Video
    return FileType.Unknown
}

function getDefaultSettings(type: FileType): LocalSettings {
    const base: BaseSettings = {
        denoise: 0,
        upscaler: Upscaler.Waifu2x,
    }
    switch (type) {
        case FileType.Gif:
            return {
                ...base,
                type: FileType.Gif,
                quality: 100,
                speed: 1,
                cumulative: false,
            }
        case FileType.Image:
            return {
                ...base,
                type: FileType.Image,
            }
        case FileType.Video:
            return {
                ...base,
                type: FileType.Video,
                framerate: 30,
                quality: 100,
                speed: 1,
            }
        case FileType.Webp:
            return {
                ...base,
                type: FileType.Webp,
                quality: 100,
                speed: 1,
            }
        default:
            return {
                ...base,
                type: FileType.Unknown,
            }
    }
}

interface ConversionStore {
    files: ConversionFile[]
}




function createConversionsStore() {
    const { subscribe, set, update } = writable<ConversionStore>({
        files: [],
    });

    async function add(...files: File[]) {
        const parsed = await Promise.all(files.map(file => ConversionFile.from(file)))
        update(state => {
            state.files.push(...parsed)
            return state
        })
    }
    function remove(idOrFile: string| ConversionFile) {
        update(state => {
            const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id
            state.files = state.files.filter(file => file.id !== id)
            return state
        })
    }
    return {
        subscribe,
        add,
        remove
    }
}


export const conversionsStore = createConversionsStore();