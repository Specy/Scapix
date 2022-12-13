import { app, BrowserWindow, ipcMain as ipc, protocol, dialog, shell } from "electron";
import electronReloader from "electron-reloader";
import url from "url";
import path from "path";
import os from "os";
import { AsyncSemaphore } from "./utils";
import { DenoiseLevel, FileType, GlobalSettings, LocalSettings, SerializedConversionFile, SerializedSettings, Status, Upscaler } from "./common/types/Files";
import Waifu2x from "waifu2x";
import fs from "fs/promises"
import { Waifu2xOptions } from "waifu2x";
const ffmpeg = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
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
    electronStatic: path.join(base, "/static"),
    models: path.join(base, "../models/"),
    ffmpeg: path.join(base, "../ffmpeg/", ffmpeg),
}


const pool = new AsyncSemaphore(2);
let splash: BrowserWindow | undefined
function loadSplash() {
    if(hasLoaded) return;
    splash = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        center: true,
        backgroundColor:"#171A21",
        title: "Loading Scapix...",
        icon: path.join(paths.electronStatic, "/favicon.ico"),
        frame: false,
    })
    splash.loadURL(
        `file://${path.join(paths.electronStatic, "/splash.html")}`
    )
    splash.on('closed', () => (splash = undefined));
    splash.webContents.on('did-finish-load', () => {
        splash?.show()
    });
}

let hasLoaded = false;
function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        title: "Scapix",
        backgroundColor:"#171A21",
        center: true,
        //transparent: true,
        //frame: false,
        icon: path.join(paths.electronStatic, "/favicon.ico"),
        show: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if (isDev) {
        win.loadURL("http://localhost:3123");
        //retry every 500ms
        win.webContents.on("did-fail-load", () => {
            console.log("Failed to load, retrying in 500ms");
            setTimeout(() => win.loadURL("http://localhost:3123"), 500);
        })
    } else {
        win.loadFile(path.join(paths.svelteDist, "/index.html"));
    }
    win.webContents.on('did-finish-load', () => {
        splash?.close();
        win.show();
        hasLoaded = true;
        setTimeout(() => {
            win.setAlwaysOnTop(false)
        }, 200)
    })
    setUpIpc(win);
}
function denoiseLevelToNumber(level: DenoiseLevel) {
    switch (level) {
        case DenoiseLevel.None: return 0;
        case DenoiseLevel.Low: return 1;
        case DenoiseLevel.Medium: return 2;
        case DenoiseLevel.High: return 3;
    }
}

function finalizeSettings(settings: LocalSettings, globals: GlobalSettings, appSettings: SerializedSettings) {
    const final: Waifu2xOptions = { ...settings }
    final.scale = final.scale ?? globals.scale;
    final.noise = denoiseLevelToNumber(settings.denoise ?? globals.denoise);
    final.parallelFrames = appSettings.maxConcurrentFrames;
    const isWaifu2x = (settings.upscaler ?? globals.upscaler) === Upscaler.Waifu2x;
    const model = settings.waifu2xModel ?? globals.waifu2xModel;
    if(isWaifu2x && model !== "drawing"){
        final.modelDir = modelToPath(model);
    }
    final.upscaler = settings.upscaler ?? globals.upscaler
    return final;
}
function modelToPath(model: string) {
    return path.join(paths.models, model);
}

function setUpIpc(win: BrowserWindow) {
    //all files that are either being converted or are queued to be converted
    const pendingFiles = new Map<string, SerializedConversionFile>();
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
    ipc.handle("get-waifu-models", async () => {
        const models =  await fs.readdir(paths.models)
        models.unshift("drawing")
        return models;
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
    ipc.handle("halt-one-execution", (e, idOrFile: string | SerializedConversionFile) => {
        const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id;
        const file = pendingFiles.get(id);
        pendingFiles.delete(id);
        if (file) {
            win.webContents.send("file-status-change", file, { status: Status.Idle })
        }  
    })
    ipc.handle("halt-all-executions", () => {  
        for (const file of pendingFiles.values()) {
            win.webContents.send("file-status-change", file, { status: Status.Idle })
        }
        pendingFiles.clear();
    })
    ipc.handle("execute-files", async (e, files: SerializedConversionFile[], globals: GlobalSettings, settings: SerializedSettings) => {
        pool.setCapacity(settings.maxConcurrentOperations);
        for( const file of files ){
            win.webContents.send("file-status-change", file, { status: Status.Waiting })
        }
        const out = settings.outputDirectory
        const promises = [];
        for (const file of files) {
            const opts = finalizeSettings(file.settings, globals, settings)
            console.log(opts)
            pendingFiles.set(file.id, file);
            promises.push(pool.add(async () => {
                if(!pendingFiles.get(file.id)) return; //stop if file was cancelled
                win.webContents.send("file-status-change", file, { status: Status.Converting })
                try {
                    const initialPath = path.join(out, file.finalName)
                    const resultPath = finalizePath(initialPath, opts, settings)
                    switch (file.settings.type) {
                        case FileType.Image:
                            await Waifu2x.upscaleImage(
                                file.path,
                                resultPath,
                                opts,
                                (progress) => {
                                    console.log(`${progress}%`)
                                    if(!pendingFiles.get(file.id)) return false; //stop if file was cancelled
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, progress })
                                }
                            ); break;
                        case FileType.Video:
                            //TODO add progress
                            await Waifu2x.upscaleVideo(
                                file.path,
                                resultPath,
                                {...opts, ffmpegPath: paths.ffmpeg},
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                    if(!pendingFiles.get(file.id)) return false; //stop if file was cancelled
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                        case FileType.Gif:
                            //TODO add progress
                            await Waifu2x.upscaleGIF(
                                file.path, 
                                resultPath, 
                                opts,
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                    if(!pendingFiles.get(file.id)) return false; //stop if file was cancelled
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                        case FileType.Webp:
                            //TODO add progress
                            await Waifu2x.upscaleAnimatedWebp(
                                file.path, 
                                resultPath, 
                                opts,
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                    if(!pendingFiles.get(file.id)) return false; //stop if file was cancelled
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                    }
                    console.log("done", file)
                    if(!pendingFiles.get(file.id)) return console.log("file was cancelled", file);
                    win.webContents.send("file-status-change", file, { status: Status.Done, resultPath })
                    pendingFiles.delete(file.id);
                } catch (e) {
                    win.webContents.send("file-status-change", file, { status: Status.Error, error: e })
                    console.error(e);
                    return;
                }
            }))
        }
        await Promise.all(promises);
        flashFrame(win, 3000);   
    })
    win.on("maximize", () => win.webContents.send("maximize-change", true))
    win.on("unmaximize", () => win.webContents.send("maximize-change", false))

}


type PathOptions = {
    saveInDatedFolder: boolean
    appendUpscaleSettingsToFileName: boolean
}
function finalizePath(base: string, upscaleSettings: Waifu2xOptions , opts: PathOptions){
    //finalizes the path to the output file
    //Ex: "C:\Users\user\Downloads\image.png" -> "C:\Users\user\Downloads\{folder}\image.{options}.png"
    const { saveInDatedFolder, appendUpscaleSettingsToFileName } = opts;
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const suffix = `${upscaleSettings.upscaler}-${upscaleSettings.scale}x_${upscaleSettings.noise}`;
    const ext = path.extname(base);
    const name = path.basename(base, ext);
    const dir = path.dirname(base);
    const outDir = saveInDatedFolder ? path.join(dir, dateStr) : dir;
    const outName = appendUpscaleSettingsToFileName ? `${name}.${suffix}` : name;
    return path.join(outDir, outName + ext);
}


let lastTimeout: NodeJS.Timeout;
function flashFrame(win: BrowserWindow, duration: number = 1000) {
    win.flashFrame(true);
    clearTimeout(lastTimeout);
    lastTimeout = setTimeout(() => win.flashFrame(false), duration);
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
app.whenReady().then(() => {
    loadSplash()
    createWindow()
    protocol.registerFileProtocol('resource', (request, callback) => {
        const filePath = url.fileURLToPath('file://' + request.url.slice('resource://'.length))
        callback(filePath)
    })
})