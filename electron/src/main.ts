import { app, BrowserWindow, ipcMain as ipc} from "electron";
import electronReloader from "electron-reloader";
import path from "path";
const isDev = !app.isPackaged
const paths = {
    svelteDist: path.join(__dirname, "../client/build"),
    electronDist: path.join(__dirname, "/dist"),
    electronClient: path.join(__dirname, "/client"),
}

try{
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
        //show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if(isDev){
        win.loadURL("http://localhost:3123");
    }else{
        win.loadFile(path.join(paths.svelteDist, "/index.html"));
    }
    setUpIpc(win);
}

function setUpIpc(win: BrowserWindow) {
    ipc.handle("minimize", () => win.minimize())
    ipc.handle("maximize", () => win.maximize())
    ipc.handle("close", () => win.close())
    ipc.handle("ping", () => "pong")
    ipc.handle("toggleMaximize", () => {
        if(win.isMaximized()){
            win.unmaximize();
        }else{
            win.maximize();
        }
    })
    win.on("maximize", () => win.webContents.send("maximize-change", true))
    win.on("unmaximize", () => win.webContents.send("maximize-change", false))
}



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
})

