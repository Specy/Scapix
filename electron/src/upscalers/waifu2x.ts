import { DenoiseLevel } from "common/types/Files";
import { Upscaler, UpscalerSchema, defaultUpscalerOptions , ConcreteOptionsOf, UpscalerResult} from "./upscalers.interface";
import Waifu2x, { Waifu2xOptions } from "waifu2x";
import path from "path";
import { PATHS } from "utils";
export const waifu2xSchema = {
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
        },
        cumulative: {
            type: "boolean",
            default: false,
        },
        transparency: {
            type: "boolean",
            default: false,
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
} satisfies UpscalerSchema
type Waifu2xSchema = typeof waifu2xSchema
class Waifu2xUpscaler implements Upscaler<Waifu2xSchema> {
    name = 'waifu2x' as const
    schema = waifu2xSchema


    async upscaleImage(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "image">): Promise<UpscalerResult> {
        const finalOptions = {
            scale: options.scale,
            noise: denoiseLevelToNumber(options.denoise),
            modelDir: modelToPath(options.model),
        } satisfies Waifu2xOptions
        const promise = Waifu2x.upscaleImage(
            from,
            to,
            finalOptions,
        ); 
        throw new Error("Method not implemented.");
    }
    async upscaleVideo(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "video">): Promise<UpscalerResult> {
        throw new Error("Method not implemented.");
    }
    async upscaleGif(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "gif">): Promise<UpscalerResult> {
        throw new Error("Method not implemented.");
    }
    async upscaleWebp(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "webp">): Promise<UpscalerResult> {
        throw new Error("Method not implemented.");
    }
    async upscaleWebpAnimated(from: string, to: string, options: ConcreteOptionsOf<Waifu2xSchema, "webpAnimated">): Promise<UpscalerResult> {
        throw new Error("Method not implemented.");
    }

}   


function denoiseLevelToNumber(level: DenoiseLevel) {
    switch (level) {
        case DenoiseLevel.None: return 0;
        case DenoiseLevel.Low: return 1;
        case DenoiseLevel.Medium: return 2;
        case DenoiseLevel.High: return 3;
        default: return 0;
    }
}

function modelToPath(model: string) {
    return path.join(PATHS.models, model);
}