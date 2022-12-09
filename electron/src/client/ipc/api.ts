import { contextBridge, ipcRenderer as ipc } from "electron";





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
        return ipc.invoke("toggleMaximize")
    },
    addOnMaximizationChange: (callback: (isMaximized: boolean) => void) => {
        const id = EventListeners.generateId();
        const listener = {
            id, 
            callback: (e: any, data: any) => {
                console.log(e, data)
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
    }
}
export type Api = typeof api;
contextBridge.exposeInMainWorld("api", api)