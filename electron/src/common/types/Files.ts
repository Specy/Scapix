import type { AppSchema, AppUpscaleSettings, SchemaType, ConcreteOptionsOf, ConcreteSchema, UpscalerName, FileTypes, UpscaleSettings, OptionalUpscaleSettings } from "upscalers/upscalers.interface"

export type {
    AppSchema,
    AppUpscaleSettings,
    SchemaType, 
    UpscaleSettings,
    ConcreteOptionsOf,
    ConcreteSchema,
    FileTypes,
    UpscalerName,
    OptionalUpscaleSettings
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


export type SerializedSettings = {
    maxConcurrentOperations: number
    maxConcurrentFrames: number
    outputDirectory: string
    saveInDatedFolder: boolean
    appendUpscaleSettingsToFileName: boolean
}


export type Stats = {
    size: number
    width: number
    height: number
}

export interface SerializedConversionFile {
    id: string
    finalName: string
    status: StatusUpdate
    settings: OptionalUpscaleSettings
    type: FileTypes
    stats: Stats
    path: string
}