import { contextBridge, ipcRenderer as ipc } from "electron";
import { GlobalSettings, SerializedConversionFile, SerializedSettings, Status, StatusUpdate } from "../../common/types/Files";
type EventListener = {
    id: string,
    callback: (...args: any[]) => void
}
class EventListeners{
    private listeners = new Map<string, EventListener[]>();
    static generateId(){
        return Math.random().toString(36).substring(2, 9);
    }
    addListener(event: string, listener: EventListener){
        if(!this.listeners.has(event)){
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(listener);
    }
    removeListener(event: string, listener: EventListener | string| Function){
        if(!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event)!;
        const index = listeners.findIndex((l) => {
            if(typeof listener === "string") return l.id === listener;
            if(typeof listener === "function") return l.callback === listener;
            return l.id === listener.id;
        });
        if(index < 0) return;
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
    removeOnMaximizationChange: (id: string) => {
        const listener = eventListeners.removeListener("maximize-change", id);
        if(!listener) return;
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
    stopAll: async () => {
        return ipc.invoke("stop-all")
    },
    stopOne: async (id: string) => {
        return ipc.invoke("stop-one", id)
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
        if(!listener) return;
        ipc.removeListener("file-status-change", listener.callback);
    }
}

export type Api = typeof api;
contextBridge.exposeInMainWorld("api", api)