import { Err, FunctionMiddleware, Ok, PATHS, } from "../utils";
import type { ConcreteOptionsOf, Progress, Upscaler, UpscalerResult, UpscalerSchema } from "./upscalers.interface";
import Waifu2x, { Waifu2xGIFOptions, Waifu2xOptions, Waifu2xVideoOptions } from "waifu2x";

export const esrgan4xSchema = {
    defaults: {
        gif: { scale: 4 },
        video: { scale: 4 },
        image: { scale: 4 },
        webp: { scale: 4 },
        webpAnimated: { scale: 4 },
    },
    opts: {
        all: {
            scale: {
                type: "number",
                default: 4,
                increment: 0.1,
                min: 1,
                hidden: true,
            }
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
type Esrgan4xSchema = typeof esrgan4xSchema

export class Esrgan4XUpscaler implements Upscaler<Esrgan4xSchema> {
    name = 'esrgan4x' as const
    schema = esrgan4xSchema

    public getSchema() {
        return Promise.resolve(this.schema)
    }

    async dispose(): Promise<void> {
        Waifu2x.processes.forEach(p => p.kill("SIGINT"));
        Waifu2x.processes = [];
    }
    async upscaleImage(from: string, to: string, options: ConcreteOptionsOf<Esrgan4xSchema, "image">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: 4,
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
    async upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<Esrgan4xSchema, "video">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: 4,
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
    async upscaleGif(from: string, to: string, options: ConcreteOptionsOf<Esrgan4xSchema, "gif">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: 'real-esrgan',
            scale: 4,
            quality: options.quality,
            speed: options.speed,
            noResume: true,
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
    async upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<Esrgan4xSchema, "webp">): Promise<UpscalerResult> {
        return this.upscaleImage(from, to, options)
    }
    async upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<Esrgan4xSchema, "webpAnimated">): Promise<UpscalerResult> {
        return this.upscaleGif(from, to, options)
    }
}
