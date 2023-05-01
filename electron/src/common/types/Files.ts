import type { AppSchema, ConcreteOptionsOf, FileTypes, UpscalerSchema, AppUpscaleSettings } from "upscalers/upscalers.interface"

export {
    AppSchema,
    AppUpscaleSettings
}
export enum FileType {
    Image = "image",
    Video = "video",
    Gif = "gif",
    Webp = "webp",
    WebpAnimated = "webp-animated",
    Unknown = "unknown"
}

export enum UpscalerName {
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
export type StatusUpdate = {
    status: Status.Idle | Status.Waiting
} | {
    status: Status.Error
    error: string
} | {
    status: Status.Done
    resultPath: string
} | {
    status: Status.Converting
    progress?: number
    currentFrame?: number
    totalFrames?: number
}

export enum DenoiseLevel {
    None = "none",
    Low = "low",
    Medium = "medium",
    High = "high",
}

export type GlobalSettings = {
    scale: number
    denoise: DenoiseLevel
    waifu2xModel: "drawing" | "photo" | string
    upscaler: UpscalerName
}

export type BaseSettings = {
    scale?: number
    denoise?: DenoiseLevel
    upscaler?: UpscalerName
    waifu2xModel?: "drawing" | "photo" | string
}

export type SerializedSettings = {
    maxConcurrentOperations: number
    maxConcurrentFrames: number
    outputDirectory: string
    saveInDatedFolder: boolean
    appendUpscaleSettingsToFileName: boolean
}
export type LocalSettings = BaseSettings & ({
    type: FileType.Gif
    quality?: number
    speed?: number
    cumulative?: boolean
    transparency?: boolean
} | {
    type: FileType.Image | FileType.Webp
} | {
    type: FileType.Video
    quality?: number
    speed?: number
} | {
    type: FileType.WebpAnimated
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

export interface SerializedConversionFile {
    id: string
    finalName: string
    status: StatusUpdate
    settings: LocalSettings
    stats: Stats
    path: string
}