import { DenoiseLevel } from "common/types/Files"
import { waifu2xSchema } from "./waifu2x"
import { Ok, Result, Err } from "ts-results"
import { esrganSchema } from "./esrgan"


const schema = {
    waifu2x: waifu2xSchema,
    esrgan: esrganSchema
} satisfies RecordSchema

export const defaultUpscalerOptions = {
    scale: {
        type: "number",
        default: 2,
    },
    denoise: {
        type: "list",
        default: DenoiseLevel.None,
        items: Object.values(DenoiseLevel)
    }
} satisfies Record<string, SchemaType>


class UpscalerHandler {
    private upscalers: Map<Upscalers, Upscaler<any>> = new Map()
    getUpscaler<T extends Upscalers>(name: T): Result<Upscaler<Schemas[T]>, string> {
        const upscaler = this.upscalers.get(name)
        if (upscaler) {
            return Ok(upscaler)
        } else {
            return Err(`Upscaler ${name} not found`)
        }
    }
    upscale<T extends Upscalers>(name: T, type: FileTypes, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], FileTypes>): Result<Promise<UpscalerResult>, string> {
        switch (type) {
            case "image":
                return this.upscaleImage(name, from, to, options as ConcreteOptionsOf<Schemas[T], "image">)
            case "video":
                return this.upscaleVideo(name, from, to, options as ConcreteOptionsOf<Schemas[T], "video">)
            case "gif":
                return this.upscaleGif(name, from, to, options as ConcreteOptionsOf<Schemas[T], "gif">)
            case "webp":
                return this.upscaleWebp(name, from, to, options as ConcreteOptionsOf<Schemas[T], "webp">)
            case "webpAnimated":
                return this.upscaleWebpAnimated(name, from, to, options as ConcreteOptionsOf<Schemas[T], "webpAnimated">)

            default:
                return Err(`Upscaler ${name} does not support ${type}`)
        }
    }
    upscaleVideo<T extends Upscalers>(name: T, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], "video">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.val
        return Ok(upscaler.upscaleVideo(from, to, options))
    }
    upscaleImage<T extends Upscalers>(name: T, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], "image">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.val
        return Ok(upscaler.upscaleImage(from, to, options))
    }
    upscaleGif<T extends Upscalers>(name: T, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], "gif">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.val
        return Ok(upscaler.upscaleGif(from, to, options))
    }
    upscaleWebp<T extends Upscalers>(name: T, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], "webp">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.val
        return Ok(upscaler.upscaleWebp(from, to, options))
    }
    upscaleWebpAnimated<T extends Upscalers>(name: T, from: string, to: string, options: ConcreteOptionsOf<Schemas[T], "webpAnimated">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.val
        return Ok(upscaler.upscaleWebpAnimated(from, to, options))
    }
}


export const upscalerHandler = new UpscalerHandler()





export interface UpscalerResult {
    onProgress: (callback: (progress: Progress) => void) => void
    cancel(): void
    result(): Promise<Result<string, string>>
}
export type SchemaList<T> = {
    type: "list"
    default: T
    items: T[]
}
export type SchemaNumber = {
    type: "number"
    default: number
}
export type SchemaBoolean = {
    type: "boolean"
    default: boolean
}
export type SchemaString = {
    type: "string"
    default: string
}
export type SchemaType = {
    hidden?: boolean
} & (SchemaList<any> | SchemaNumber | SchemaBoolean | SchemaString)

export type Progress = {
    type: "interval"
    current: number
    total: number
} | {
    type: "progress"
    progress: number
} 
type UpscalerSchemaOptions = {
    image: Record<string, SchemaType>
    video: Record<string, SchemaType>
    gif: Record<string, SchemaType>
    webp: Record<string, SchemaType>
    webpAnimated: Record<string, SchemaType>
    all: Record<string, SchemaType>
}

export type UpscalerSchema = {
    opts: UpscalerSchemaOptions
}



type RecordSchema = Record<string, UpscalerSchema>

type UpscalerName = keyof typeof schema
export type Schemas = typeof schema
export type Upscalers = keyof Schemas
export type FileTypes = Exclude<keyof Schemas[Upscalers]['opts'], "all">
export type UpscalerOptionsOf<T extends UpscalerSchemaOptions, F extends FileTypes> = T["all"] & T[F]

export type ConcreteSchema<T extends SchemaType> = T extends SchemaList<infer U>
    ? U
    : T extends SchemaNumber
    ? number
    : T extends SchemaBoolean
    ? boolean
    : T extends SchemaString
    ? string
    : never

export type ConcreteOptionsOf<T extends UpscalerSchema, F extends FileTypes> = {
    [K in keyof UpscalerOptionsOf<T['opts'],F>]: ConcreteSchema<UpscalerOptionsOf<T['opts'],F>[K]>
}


export interface Upscaler<T extends UpscalerSchema> {
    schema: T
    name: UpscalerName
    upscaleImage(from: string, to: string, options: ConcreteOptionsOf<T, "image">): Promise<UpscalerResult>
    upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<T, "video">): Promise<UpscalerResult>
    upscaleGif(from: string, to: string, options: ConcreteOptionsOf<T, "gif">): Promise<UpscalerResult>
    upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<T, "webp">): Promise<UpscalerResult>
    upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<T, "webpAnimated">): Promise<UpscalerResult>
}
