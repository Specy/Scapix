import { contextBridge, ipcRenderer as ipc } from "electron";


contextBridge.exposeInMainWorld("api", {
    ping: async () => {
        return ipc.invoke("ping")
    }
})