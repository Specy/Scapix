import type { UpscalerName, AppUpscaleSettings, AppSchema, FileTypes, ConcreteOptionsOf } from "$common/types/Files";
import { derived, writable, type Readable, get } from "svelte/store";




function createSchemaStore() {
    const { subscribe, set, update } = writable<{
        schema: AppSchema | null
        currentUpscaler: UpscalerName
        currentGlobalSchema: AppSchema[UpscalerName]['opts']['all'] | null
        currentGlobalSettings: ConcreteOptionsOf<AppSchema[UpscalerName], 'all'> | null
        globalSettings: {
            [K in UpscalerName]: ConcreteOptionsOf<AppSchema[K], 'all'>
        } | null
    }>({
        currentUpscaler: "waifu2x",
        schema: null,
        currentGlobalSettings: null,
        currentGlobalSchema: null,
        globalSettings: null
    });

    function setSchema(schema: AppSchema) {
        update(v => {
            const settings = Object.fromEntries(Object.entries(schema).map(([k, v]) => {
                const options = Object.fromEntries(
                    Object.entries(v.opts.all)
                        .map(([propKey, propValue]) => [propKey, propValue.default])
                )
                return [k, options]
            })) as { [K in UpscalerName]: ConcreteOptionsOf<AppSchema[K], 'all'> }
            return {
                ...v,
                schema,
                currentGlobalSchema: schema[v.currentUpscaler].opts.all,
                currentGlobalSettings: settings[v.currentUpscaler],
                globalSettings: settings
            }
        })
    }
    function setGlobalSettingsValue<T extends UpscalerName, K extends ConcreteOptionsOf<AppSchema[T], 'all'>>(upscaler: T, key: keyof K, value: K[keyof K]) {
        update(state => {
            if (!state.globalSettings) return state;
            // @ts-ignore handled by the function types
            state.currentGlobalSettings[key] = value
            // @ts-ignore handled by the function types
            state.globalSettings[upscaler] = state.currentGlobalSettings
            return state
        })
    }
    function getSerializedGlobalSettings() {
        const value = get(schemaStore)
        return {
            ...value.currentGlobalSettings,
            upscaler: value.currentUpscaler
        }
    }
    function setCurrentUpscaler(upscaler: UpscalerName) {
        update(v => {
            return {
                ...v,
                currentUpscaler: upscaler,
                currentGlobalSchema: v.schema ? v.schema[upscaler].opts.all : null,
                currentGlobalSettings: v.globalSettings ? v.globalSettings[upscaler] : null
            }
        })
    }

    function getDefaultOf<T extends UpscalerName, F extends FileTypes>(upscaler: T, type: F): AppUpscaleSettings | null {
        const value = get(schemaStore)
        if (!value.schema) return null;
        const op = value.schema[upscaler].opts[type]
        if (!op) throw new Error(`No default value for upscaler ${upscaler} and type ${type}`)
        const opts = Object.fromEntries(Object.entries(op).map(([k, v]) => [k, v.default]))
        return {
            upscaler,
            opts: {
                type,
                values: opts as any //TODO i'm lazy to type this properly
            }
        }
    }
    function getDefaultOfType<T extends UpscalerName, F extends FileTypes>(upscaler: T, type: F): Record<string, string | number | boolean> | null{
        const value = get(schemaStore)
        if (!value.schema) return null;
        const defaults = value.schema[upscaler].defaults
        if(!defaults) return null
        return defaults[type] ?? {}
    }
    return {
        subscribe,
        setSchema,
        getDefaultOf,
        setCurrentUpscaler,
        setGlobalSettingsValue,
        getSerializedGlobalSettings,
        getDefaultOfType
    }
}



export function createDerivedSchemaStore<T extends UpscalerName, F extends FileTypes>(upscaler: T, type: F): Readable<AppSchema[T]['opts'][F] | null> {
    return derived(schemaStore, $schemas => {
        if (!$schemas.schema) return null;
        return {
            ...$schemas.schema[upscaler].opts.all,
            ...$schemas.schema[upscaler].opts[type]
        } as AppSchema[T]['opts'][F] //TODO improve this typing
    })
}




export const schemaStore = createSchemaStore();



