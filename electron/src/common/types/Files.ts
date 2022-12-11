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
    Idle = "idle",
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
    upscaler: Upscaler
}

export type BaseSettings = {
    scale?: number
    denoise?: DenoiseLevel
    upscaler?: Upscaler
}

export type SerializedSettings = {
    maxConcurrentOperations: number
    maxConcurrentFrames: number
    outputDirectory: string
}
export type LocalSettings = BaseSettings & ({
    type: FileType.Gif
    quality?: number
    speed?: number
    cumulative?: boolean
    transparency?: boolean
} | {
    type: FileType.Image
} | {
    type: FileType.Video
    quality?: number
    speed?: number
} | {
    type: FileType.Webp
    quality?: number
    speed?: number
} | {
    type: FileType.Unknown
})

export type Stats = {
    size: number
    width: number
    height: number
}

export interface SerializedConversionFile{
    id: string
    finalName: string
    status: Status
    settings: LocalSettings
    stats: Stats
    path: string
}