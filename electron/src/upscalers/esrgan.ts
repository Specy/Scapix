import { Err, FunctionMiddleware, Ok, PATHS, denoiseLevelToNumber, modelToPath } from "../utils";
import { defaultUpscalerOptions } from "./default";
import type { ConcreteOptionsOf, Progress, Upscaler, UpscalerResult, UpscalerSchema } from "./upscalers.interface";
import Waifu2x, { Waifu2xGIFOptions, Waifu2xOptions, Waifu2xVideoOptions } from "waifu2x";

export const esrganSchema = {
    opts: {
        all: {
            ...defaultUpscalerOptions
        },
        gif: {
            quality: {
                type: "number",
                default: 0,
                increment: 1,
                min: 0,
                max: 51
            },
            speed: {
                type: "number",
                default: 1,
                increment: 0.1,
                min: 0.1,
            },
            parallelFrames: {
                type: "number",
                default: 1,
                hidden: true,
                increment: 1,
                min: 1,
            }
        },
        video: {
            quality: {
                type: "number",
                default: 0,
                min: 0,
                increment: 1,
                max: 51
            },
            speed: {
                type: "number",
                default: 1,
                increment: 0.1,
                min: 0.1,
            },
            parallelFrames: {
                type: "number",
                default: 1,
                hidden: true,
                increment: 1,
                min: 1,
            }
        },
        image: {},
        webp: {},
        webpAnimated: {
            quality: {
                type: "number",
                default: 0,
                increment: 1,
                min: 0,
                max: 51
            },
            speed: {
                type: "number",
                default: 1,
                increment: 0.1,
                min: 0.1,
            },
            parallelFrames: {
                type: "number",
                default: 1,
                hidden: true,
                increment: 1,
                min: 1,
            }
        }
    }
} satisfies UpscalerSchema
type EsrganSchema = typeof esrganSchema

export class EsrganUpscaler implements Upscaler<EsrganSchema> {
    name = 'esrgan' as const
    schema = esrganSchema

    public getSchema() {
        return Promise.resolve(this.schema)
    }

    async dispose(): Promise<void> {
        Waifu2x.processes.forEach(p => p.kill("SIGINT"));
        Waifu2x.processes = [];
    }
    async upscaleImage(from: string, to: string, options: ConcreteOptionsOf<EsrganSchema, "image">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
        } satisfies Waifu2xOptions
        const state = {
            halted: false,
        }
        const middleware = new FunctionMiddleware((progress: number | undefined) => {
            return state.halted;
        })
        const promise = Waifu2x.upscaleImage(
            from,
            to,
            finalOptions,
            middleware.origin()
        );

        return {
            cancel: () => {
                state.halted = true;
            },
            onProgress: (callback: (progress: Progress) => void) => {
                middleware.destination((progress) => {
                    if (progress !== undefined) {
                        callback({
                            type: "progress",
                            progress
                        })
                    }
                    return state.halted;
                })
            },
            result: async () => {
                try {
                    const result = await promise;
                    return Ok(result);
                } catch (e) {
                    return Err("Error upscaling: " + e)
                }
            }

        } satisfies UpscalerResult
    }
    async upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<EsrganSchema, "video">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            parallelFrames: options.parallelFrames,
            quality: options.quality,
            speed: options.speed,
            noResume: true,
            ffmpegPath: PATHS.ffmpeg,
        } satisfies Waifu2xVideoOptions
        const state = {
            halted: false,
        }
        const middleware = new FunctionMiddleware((current: number, total: number) => {
            return state.halted;
        })
        const promise = Waifu2x.upscaleVideo(
            from,
            to,
            finalOptions,
            middleware.origin()
        );
        return {
            cancel: () => {
                state.halted = true;
            },
            onProgress: (callback: (progress: Progress) => void) => {
                middleware.destination((current, total) => {
                    callback({
                        type: "interval",
                        current,
                        total
                    })
                    return state.halted;
                })
            },
            result: async () => {
                try {
                    const result = await promise;
                    return Ok(result);
                } catch (e) {
                    return Err("Error upscaling: " + e)
                }
            }
        } satisfies UpscalerResult

    }
    async upscaleGif(from: string, to: string, options: ConcreteOptionsOf<EsrganSchema, "gif">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            quality: options.quality,
            speed: options.speed,
        } satisfies Waifu2xGIFOptions
        const state = {
            halted: false,
        }
        const middleware = new FunctionMiddleware((current: number, total: number) => {
            return state.halted;
        })
        const promise = Waifu2x.upscaleGIF(
            from,
            to,
            finalOptions,
            middleware.origin()
        );
        return {
            cancel: () => {
                state.halted = true;
            },
            onProgress: (callback: (progress: Progress) => void) => {
                middleware.destination((current, total) => {
                    callback({
                        type: "interval",
                        current,
                        total
                    })
                    return state.halted;
                })
            },
            result: async () => {
                try {
                    const result = await promise;
                    return Ok(result);
                } catch (e) {
                    return Err("Error upscaling: " + e)
                }
            }
        } satisfies UpscalerResult

    }
    async upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<EsrganSchema, "webp">): Promise<UpscalerResult> {
        return this.upscaleImage(from, to, options)
    }
    async upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<EsrganSchema, "webpAnimated">): Promise<UpscalerResult> {
        return this.upscaleGif(from, to, options)
    }
}
