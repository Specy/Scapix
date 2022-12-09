import { app, BrowserWindow, ipcMain as ipc, protocol, dialog, shell} from "electron";
import fs from "fs/promises";
import electronReloader from "electron-reloader";
import url from "url";
import path from "path";
const isDev = !app.isPackaged
const base = path.join(__dirname, "../");
const paths = {
    svelteDist: path.join(base, "../client/build"),
    electronDist: path.join(base, "/dist"),
    electronClient: path.join(base, "/dist/client"),
    electronStatic: path.join(base, "/static")
}

try {
    electronReloader(module);
} catch (error) {
    console.log(error);
}
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        icon: path.join(paths.electronStatic, "/favicon.ico"),
        //show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if (isDev) {
        win.loadURL("http://localhost:3123");
    } else {
        win.loadFile(path.join(paths.svelteDist, "/index.html"));
    }
    setUpIpc(win);
}

function setUpIpc(win: BrowserWindow) {
    ipc.handle("minimize", () => win.minimize())
    ipc.handle("maximize", () => win.maximize())
    ipc.handle("close", () => win.close())
    ipc.handle("ping", () => "pong")
    ipc.handle("toggle-maximize", () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    })
    ipc.handle("ask-directory", async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"]
        })
        return result.filePaths[0];
    })
    ipc.on("goto-external", (e, url) => {
        shell.openExternal(url);
    })
    
    win.on("maximize", () => win.webContents.send("maximize-change", true))
    win.on("unmaximize", () => win.webContents.send("maximize-change", false))
}




app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
    protocol.registerFileProtocol('resource', (request, callback) => {
        console.log(request)
        console.log(request.url)
        const filePath = url.fileURLToPath('file://' + request.url.slice('resource://'.length))
        callback(filePath)
    })
})

