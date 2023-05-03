import { DenoiseLevel, SchemaType } from "../common/types/Files";


export const defaultUpscalerOptions = {
    scale: {
        type: "number",
        default: 2,
        increment: 0.1,
        min: 1,
    },
    denoise: {
        type: "list",
        default: DenoiseLevel.None,
        items: Object.values(DenoiseLevel)
    }
} as const satisfies Record<string, SchemaType>
