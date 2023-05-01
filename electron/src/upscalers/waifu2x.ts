import { Upscaler, UpscalerSchema, defaultUpscalerOptions, ConcreteOptionsOf, UpscalerResult, Progress } from "./upscalers.interface";
import Waifu2x, { Waifu2xGIFOptions, Waifu2xOptions, Waifu2xVideoOptions } from "waifu2x";
import { Ok, Err } from "ts-results/result";
import { FunctionMiddleware, PATHS, denoiseLevelToNumber, modelToPath } from "../utils";
export const waifu2xSchema = {
    opts: {
        all: {
            ...defaultUpscalerOptions,
            model: {
                type: "list",
                default: "photo",
                items: ["photo", "drawing"]
            }
        },
        gif: {
            quality: {
                type: "number",
                default: 100,
            },
            speed: {
                type: "number",
                default: 1,
            }
        },
        video: {
            quality: {
                type: "number",
                default: 100,
            },
            speed: {
                type: "number",
                default: 1,
            },
            parallelFrames: {
                type: "number",
                default: 1,
                hidden: true,
            }
        },
        image: {},
        webp: {},
        webpAnimated: {
            quality: {
                type: "number",
                default: 100,
            },
            speed: {
                type: "number",
                default: 1,
            },
        }
    }
} satisfies UpscalerSchema
type Waifu2xSchema = typeof waifu2xSchema
class Waifu2xUpscaler implements Upscaler<Waifu2xSchema> {
    name = 'waifu2x' as const
    schema = waifu2xSchema


    async upscaleImage(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "image">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: "waifu2x",
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            modelDir: modelToPath(options.model),
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
    async upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "video">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: "waifu2x",
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            modelDir: modelToPath(options.model),
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
                        type:"interval",
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
                }catch (e) {
                    return Err("Error upscaling: " + e)
                }
            }
        } satisfies UpscalerResult

    }
    async upscaleGif(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "gif">): Promise<UpscalerResult> {
        const finalOptions = {
            upscaler: "waifu2x",
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            modelDir: modelToPath(options.model),
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
                        type:"interval",
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
                }catch (e) {
                    return Err("Error upscaling: " + e)
                }
            }
        } satisfies UpscalerResult

    }
    async upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "webp">): Promise<UpscalerResult> {
        return this.upscaleImage(from, to, options)
    }
    async upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "webpAnimated">): Promise<UpscalerResult> {
        return this.upscaleGif(from, to, options)
    }

}
