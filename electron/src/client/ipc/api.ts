import { contextBridge, ipcRenderer as ipc } from "electron";
import { SerializedConversionFile, SerializedSettings, StatusUpdate } from "../../common/types/Files";
import { AppSchema, GlobalSettings, OptionalUpscaleSettings, SchemaType } from "upscalers/upscalers.interface";
type EventListener = {
    id: string,
    callback: (...args: any[]) => void
}
class EventListeners {
    private listeners = new Map<string, EventListener[]>();
    static generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
    addListener(event: string, listener: EventListener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(listener);
    }
    removeListener(event: string, listener: EventListener | string | Function) {
        if (!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event)!;
        const index = listeners.findIndex((l) => {
            if (typeof listener === "string") return l.id === listener;
            if (typeof listener === "function") return l.callback === listener;
            return l.id === listener.id;
        });
        if (index < 0) return;
        return listeners.splice(index, 1)[0];
    }
}

const eventListeners = new EventListeners();
const controls = {
    close: async () => {
        return ipc.invoke("close")
    },
    minimize: async () => {
        return ipc.invoke("minimize")
    },
    maximize: async () => {
        return ipc.invoke("maximize")
    },
    toggleMaximize: async () => {
        return ipc.invoke("toggle-maximize")
    },
    addOnMaximizationChange: (callback: (isMaximized: boolean) => void) => {
        const id = EventListeners.generateId();
        const listener = {
            id,
            callback: (e: any, data: any) => {
                callback(data);
            }
        }
        eventListeners.addListener("maximize-change", listener);
        ipc.on("maximize-change", listener.callback);
        return id;
    },
    addOnLog: (callback: (type: "error" | "log" | "warn", message: string, timeout?: number) => void) => {
        const id = EventListeners.generateId()
        const listener = {
            id, 
            callback: (e: any, data: any) => {
                const {type, message, timeout} = data
                callback(type, message, timeout)
            }
        }
        eventListeners.addListener("log", listener)
        ipc.on("log-to-renderer", listener.callback)
    },
    removeOnLog: (id: string) => {
        const listener = eventListeners.removeListener("log-to-renderer", id);
        if (!listener) return;
        ipc.removeListener("log-to-renderer", listener.callback);
    },
    removeOnMaximizationChange: (id: string) => {
        const listener = eventListeners.removeListener("maximize-change", id);
        if (!listener) return;
        ipc.removeListener("maximize-change", listener.callback);
    }
}
export type Controls = typeof controls;
contextBridge.exposeInMainWorld("controls", controls)




const api = {
    ping: async () => {
        return ipc.invoke("ping")
    },
    askDirectory: async () => {
        return ipc.invoke("ask-directory") as Promise<string | undefined>
    },
    gotoExternal: (url: string) => {
        return ipc.send("goto-external", url)
    },

    executeFiles: async (files: SerializedConversionFile[], globals: GlobalSettings, settings: SerializedSettings) => {
        return ipc.invoke("execute-files", files, globals, settings)
    },
    haltOne: async (idOrfile: SerializedConversionFile | string) => {
        return ipc.invoke("halt-one-execution", idOrfile)
    },
    getUpscalersSchema: async () => {
        return ipc.invoke("get-upscalers-schema") as Promise<AppSchema>
    },
    checkUpdate: async () => {
        return ipc.invoke("check-update") as Promise<string | null>
    },
    openDir: async (dir: string) => {
        return ipc.invoke("open-dir", dir)
    },
    haltAll: async () => {
        return ipc.invoke("halt-all-executions")
    },
    onProcessStatusChange: (callback: (file: SerializedConversionFile, status: StatusUpdate) => void) => {
        const listener = {
            id: EventListeners.generateId(),
            callback: (_: any, file: SerializedConversionFile, status: StatusUpdate) => callback(file, status)
        }
        eventListeners.addListener("file-status-change", listener);
        ipc.on("file-status-change", listener.callback);
        return listener.id;
    },
    removeOnProcessStatusChange: (id: string) => {
        const listener = eventListeners.removeListener("file-status-change", id);
        if (!listener) return;
        ipc.removeListener("file-status-change", listener.callback);
    }
}

export type Api = typeof api;
contextBridge.exposeInMainWorld("api", api)