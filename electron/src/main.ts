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
        width: 1400,
        height: 1400,
        //transparent: true,
        //frame: false,
        //show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if(isDev){
        win.loadURL("http://localhost:3123");
        win.webContents.openDevTools()
    }else{
        win.loadFile(path.join(paths.svelteDist, "/index.html"));
    }
}

ipc.handle("ping", () => "pong")

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
})

