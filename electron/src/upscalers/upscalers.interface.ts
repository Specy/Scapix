import { Waifu2xUpscaler } from "./waifu2x"
import { EsrganUpscaler } from "./esrgan"
import { SerializedSettings } from "../common/types/Files"
import { Err, Ok, Result } from "../utils"
import { Esrgan4XUpscaler } from "./esrgan4x"


export const UPSCALERS = {
    waifu2x: new Waifu2xUpscaler(),
    esrgan: new EsrganUpscaler(),
    esrgan4x: new Esrgan4XUpscaler()
} as const




class UpscalerHandler {
    private upscalers: Map<UpscalerName, Upscaler<any>> = new Map()

    constructor() {
        for (const [name, upscaler] of Object.entries(UPSCALERS)) {
            this.upscalers.set(name as UpscalerName, upscaler)
        }
    }


    async getSchemas(): Promise<Result<AppSchema, string>> {
        const schemas = new Map<UpscalerName, UpscalerSchema>()
        for (const [name, upscaler] of this.upscalers) {
            const schema = await upscaler.getSchema()
            schemas.set(name, schema)
        }
        return Ok(Object.fromEntries(schemas) as AppSchema)
    }

    mergeSettings(global: GlobalSettings, settings: OptionalUpscaleSettings, generalSettings: SerializedSettings): Result<ConcreteOptionsOf<AppSchema[UpscalerName], FileTypes> & { upscaler: UpscalerName }, string> {
        //TODO refactor this mess
        const upscalerResult = this.getUpscaler((settings.upscaler ?? global.upscaler) as UpscalerName)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
        const schema = upscaler.schema
        const schemaType = {
            ...schema.opts.all,
            ...schema.opts[settings.opts.type]
        } as Record<string, SchemaType>
        const merged = {
            ...settings.opts.values,
            upscaler: upscaler.name
        } as ConcreteOptionsOf<AppSchema[UpscalerName], FileTypes> & { upscaler: UpscalerName }

        //TODO do i even need those?
        if (schemaType['scale'] !== undefined) {
            // @ts-ignore
            merged['scale'] = settings.opts.values.scale ?? global.scale ?? schemaType.scale.default
        }
        if (schemaType['denoise'] !== undefined) {
            // @ts-ignore
            merged['denoise'] = settings.opts.values.denoise ?? global.denoise ?? schemaType.denoise.default
        }
        if (schemaType['parallelFrames'] !== undefined) {
            // @ts-ignore
            merged['parallelFrames'] = generalSettings.maxConcurrentFrames
        }
        
        for (const [key, value] of Object.entries(global)) {
            // @ts-ignore
            if (schemaType[key] && merged[key] === undefined) {
                // @ts-ignore
                merged[key] = value
            }
        }
        return Ok(merged) 
    }
    getUpscaler<T extends UpscalerName>(name: T): Result<Upscaler<AppSchema[T]>, string> {
        const upscaler = this.upscalers.get(name)
        if (upscaler) {
            return Ok(upscaler)
        } else {
            return Err(`Upscaler ${name} not found`)
        }
    }
    async dispose() {
        for (const upscaler of this.upscalers.values()) {
            await upscaler.dispose()
        }
    }
    upscale<T extends UpscalerName, F extends FileTypes>(name: T, type: F, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], F>): Result<Promise<UpscalerResult>, string> {
        switch (type) {
            case "image":
                return this.upscaleImage(name, from, to, options as ConcreteOptionsOf<AppSchema[T], "image">)
            case "video":
                return this.upscaleVideo(name, from, to, options as ConcreteOptionsOf<AppSchema[T], "video">)
            case "gif":
                return this.upscaleGif(name, from, to, options as ConcreteOptionsOf<AppSchema[T], "gif">)
            case "webp":
                return this.upscaleWebp(name, from, to, options as ConcreteOptionsOf<AppSchema[T], "webp">)
            case "webpAnimated":
                return this.upscaleWebpAnimated(name, from, to, options as ConcreteOptionsOf<AppSchema[T], "webpAnimated">)

            default:
                return Err(`Upscaler ${name} does not support ${type}`)
        }
    }
    upscaleVideo<T extends UpscalerName>(name: T, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], "video">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
        return Ok(upscaler.upscaleVideo(from, to, options))
    }
    upscaleImage<T extends UpscalerName>(name: T, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], "image">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
        return Ok(upscaler.upscaleImage(from, to, options))
    }
    upscaleGif<T extends UpscalerName>(name: T, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], "gif">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
        return Ok(upscaler.upscaleGif(from, to, options))
    }
    upscaleWebp<T extends UpscalerName>(name: T, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], "webp">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
        return Ok(upscaler.upscaleWebp(from, to, options))
    }
    upscaleWebpAnimated<T extends UpscalerName>(name: T, from: string, to: string, options: ConcreteOptionsOf<AppSchema[T], "webpAnimated">): Result<Promise<UpscalerResult>, string> {
        const upscalerResult = this.getUpscaler(name)
        if (!upscalerResult.ok) return upscalerResult
        const upscaler = upscalerResult.value
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
    increment?: number
    min?: number
    max?: number
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
type UpscalersDefaults = {
    image: Record<string, string | number>
    video: Record<string, string | number>
    gif: Record<string, string | number>
    webp: Record<string, string | number>
    webpAnimated: Record<string, string | number>
}
export type UpscalerSchema = {
    defaults?: UpscalersDefaults
    opts: UpscalerSchemaOptions
}

export type UpscalerName = keyof typeof UPSCALERS
type MergedSchema<T extends UpscalerSchema> = {
    defaults?: T extends UpscalersDefaults ? T['defaults'] : undefined
    opts: {
        [K in keyof T['opts']]: T['opts'][K] & T['opts']["all"]
    }
}

export type AppSchema = {
    [key in UpscalerName]: MergedSchema<typeof UPSCALERS[key]['schema']>
}

export type AppUpscaleSettings = UpscaleSettings<AppSchema>

export type FileTypes = keyof AppSchema[UpscalerName]['opts']
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
    [K in keyof UpscalerOptionsOf<T['opts'], F>]: ConcreteSchema<UpscalerOptionsOf<T['opts'], F>[K]>
}
export type OptionalSettings<T extends (UpscalerName | undefined), F extends FileTypes> =
    T extends UpscalerName ?
    {
        upscaler: T
        opts: {
            [K2 in FileTypes]: {
                type: K2
                values: Partial<ConcreteOptionsOf<AppSchema[T], K2>>
            }
        }[F]
    } : {
        upscaler: undefined
        opts: {
            type: F
            values: Partial<ConcreteOptionsOf<AppSchema[UpscalerName], 'all'>>
        }
    }
export type GlobalSettings = ConcreteOptionsOf<AppSchema[UpscalerName], 'all'> & { upscaler: UpscalerName }
export type OptionalUpscaleSettings = OptionalSettings<UpscalerName | undefined, FileTypes>
export type UpscaleSettings<T extends Record<string, UpscalerSchema>> = {
    [K in keyof T]: {
        upscaler: K
        opts: {
            [K2 in FileTypes]: {
                type: K2
                values: ConcreteOptionsOf<T[K], K2> & ConcreteOptionsOf<T[K], "all">
            }
        }[FileTypes]
    }
}[keyof T]

export interface Upscaler<T extends UpscalerSchema> {
    name: UpscalerName
    schema: T
    dispose(): Promise<void>
    getSchema(): Promise<UpscalerSchema>
    upscaleImage(from: string, to: string, options: ConcreteOptionsOf<T, "image">): Promise<UpscalerResult>
    upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<T, "video">): Promise<UpscalerResult>
    upscaleGif(from: string, to: string, options: ConcreteOptionsOf<T, "gif">): Promise<UpscalerResult>
    upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<T, "webp">): Promise<UpscalerResult>
    upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<T, "webpAnimated">): Promise<UpscalerResult>
}
