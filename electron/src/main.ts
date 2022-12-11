import { app, BrowserWindow, ipcMain as ipc, protocol, dialog, shell} from "electron";
import electronReloader from "electron-reloader";
import url from "url";
import path from "path";
import { AsyncSemaphore } from "./utils";
import { DenoiseLevel, FileType, GlobalSettings, LocalSettings, SerializedConversionFile, SerializedSettings, Status } from "./common/types/Files";
import Waifu2x from "waifu2x";
import { Waifu2xOptions } from "waifu2x";
//--------------------------------------//
try {
    electronReloader(module);
} catch (error) {
    console.log(error);
}
const isDev = !app.isPackaged
const base = path.join(__dirname, "../");
const paths = {
    svelteDist: path.join(base, "../client/build"),
    electronDist: path.join(base, "/dist"),
    electronClient: path.join(base, "/dist/client"),
    electronStatic: path.join(base, "/static")
}
//--------------------------------------//


const pool = new AsyncSemaphore(2);

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        transparent: true,
        frame: false,
        icon: path.join(paths.electronStatic, "/favicon.ico"),
        //show: false,
        webPreferences: {
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
function denoiseLevelToNumber(level: DenoiseLevel){
    switch(level){
        case DenoiseLevel.None: return 0;
        case DenoiseLevel.Low: return 1;
        case DenoiseLevel.Medium: return 2;
        case DenoiseLevel.High: return 3;
    }
}

function settingsToWaifu2x(settings: LocalSettings, globals: GlobalSettings) {
    const final:Waifu2xOptions = {...settings}
    final.scale = final.scale ?? globals.scale;
    final.noise = denoiseLevelToNumber(settings.denoise ?? globals.denoise);   
    return final;
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

    ipc.handle("execute-files", (e, files: SerializedConversionFile[], globals: GlobalSettings, settings: SerializedSettings) => {
        pool.setCapacity(settings.maxConcurrentOperations);
        const out = settings.outputDirectory
        for(const file of files){
            const opts = settingsToWaifu2x(file.settings, globals)
            pool.add(async () => {
                win.webContents.send("file-status-change", file, Status.Converting)
                try{
                    switch(file.settings.type){
                        case FileType.Image:
                            await Waifu2x.upscaleImage(file.path, path.join(out, file.finalName), opts); break;
                        case FileType.Video:
                            //TODO add progress
                            await Waifu2x.upscaleVideo(file.path, path.join(out, file.finalName), opts); break;   
                        case FileType.Gif:
                            //TODO add progress
                            await Waifu2x.upscaleGIF(file.path, path.join(out, file.finalName), opts); break;
                        case FileType.Webp:
                            //TODO add progress
                            await Waifu2x.upscaleAnimatedWebp(file.path, path.join(out, file.finalName), opts); break;
                    }
                }catch(e){
                    win.webContents.send("file-status-change", file, Status.Error)
                    console.error(e);
                    return;
                }
                win.webContents.send("file-status-change", file, Status.Done)
            })
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
    protocol.registerFileProtocol('resource', (request, callback) => {
        const filePath = url.fileURLToPath('file://' + request.url.slice('resource://'.length))
        callback(filePath)
    })
})

