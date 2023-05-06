import { browser } from "$app/environment"
import type { SerializedSettings } from "$common/types/Files"
import { createDebouncer } from "$lib/utils"
import { writable } from "svelte/store"


export type SettingValue<T> = {
    name: string
    type: "boolean" | "number" | "string" | "object"
    value: T
}
export type SettingValues = {
    maxConcurrentOperations: SettingValue<number>
    maxConcurrentFrames: SettingValue<number>   
    outputDirectory: SettingValue<string>
    saveInDatedFolder: SettingValue<boolean>
    appendUpscaleSettingsToFileName: SettingValue<boolean>
}
export type Settings = {
    meta: {
        version: string
    },
    values: SettingValues
}
function createValue<T>(name: string, value: T) {
    return {
        name,
        value,
        type: typeof value
    } as SettingValue<T>
}
const baseValues: SettingValues = {
    maxConcurrentOperations: createValue("Max concurrent operations", 4),
    maxConcurrentFrames: createValue("Max concurrent frames", 4),
    outputDirectory: createValue("Output directory", "./results/"),
    saveInDatedFolder: createValue("Save in folders with dates", true),
    appendUpscaleSettingsToFileName: createValue("Append upscale settings to the file name", true)
}

const debouncer = createDebouncer(1000)
const CURRENT_VERSION = "1.0.4"
function createSettingsStore() {
    const { subscribe, update, set } = writable<SettingValues>(baseValues)
    let current = baseValues
    subscribe(v => {
        current = v
        store(v)
    })
    function store(settings?: SettingValues) {
        if(!browser) return
        debouncer(() => {
            const toStore =  {
                meta: {
                    version: CURRENT_VERSION
                },
                values: settings ?? current
            }
            localStorage.setItem("scapix_settings", JSON.stringify(toStore))
        })
    }
    function fetch() {
        try {
            const stored = JSON.parse(localStorage.getItem("scapix_settings") ?? "null") as Settings
            if (!stored) return store()
            if (stored?.meta?.version !== CURRENT_VERSION) return store()
            set(stored.values)
        } catch (e) {
            console.error(e)
        }
    }
    //TODO improve typing here
    function setValue(key: keyof SettingValues, value: SettingValues[keyof SettingValues]["value"]) {
        update(settings => {
            //@ts-ignore - this should be fine
            settings[key].value = value
            return settings
        })
    }
    function serialize(): SerializedSettings {
        return {
            maxConcurrentOperations: current.maxConcurrentOperations.value,
            maxConcurrentFrames: current.maxConcurrentFrames.value,
            outputDirectory: current.outputDirectory.value,
            saveInDatedFolder: current.saveInDatedFolder.value,
            appendUpscaleSettingsToFileName: current.appendUpscaleSettingsToFileName.value
        }
    }

    if (browser) fetch()
    return {
        subscribe,
        setValue,
        set,
        serialize,
    }
}

export const settingsStore = createSettingsStore()