import { app, BrowserWindow, ipcMain as ipc, protocol, dialog, shell } from "electron";
import url from "url";
import path from "path";
import { AsyncSemaphore } from "./utils";
import { DenoiseLevel, FileType, GlobalSettings, LocalSettings, SerializedConversionFile, SerializedSettings, Status, Upscaler } from "./common/types/Files";
import Waifu2x from "waifu2x";
import fs from "fs/promises"
import serve from "electron-serve";
import { Waifu2xOptions } from "waifu2x";
import { request } from "undici";
import semver from "semver";
import ffmpeg from "@ffmpeg-installer/ffmpeg"
import log from "electron-log";
const isDev = !app.isPackaged
const root = app.getAppPath()
try{
    log.transports.file.resolvePath = () => path.join(root, 'logs/main.log');
    Object.assign(console, log.functions)
    if (require('electron-squirrel-startup')) app.quit();
}catch(e){
    console.error(e)
}
try {
    require('electron-reloader')(module)
} catch (e) {
    console.error(e)
}

const paths = {
    root,
    svelteDist: path.join(root, "/client/build"),
    electronDist: path.join(root, "/electron/dist"),
    electronClient: path.join(root, "/electron/dist/client"),
    electronStatic: path.join(root, "/electron/static"),
    models: path.join(root, "/models"),
    ffmpeg: ffmpeg.path
}


const loadURL = serve({directory: paths.svelteDist});

const pool = new AsyncSemaphore(2);
let splash: BrowserWindow | undefined
function loadSplash() {
    if (hasLoaded) return;
    splash = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1280,
        minHeight: 720,
        center: true,
        backgroundColor: "#171A21",
        title: "Loading Scapix...",
        icon: path.join(paths.electronStatic, "/icons/512x512.png") ,
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
    console.log(path.join(paths.electronStatic, "/icons/512x512.png"))
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 720,
        minHeight: 720,
        title: "Scapix",
        backgroundColor: "#171A21",
        center: true,
        icon: path.join(paths.electronStatic, "/icons/512x512.png"),
        show: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(paths.electronClient, "/ipc/api.js")
        },
    });
    function load(){
        if(isDev) {
            win.loadURL("http://localhost:3123")
        }else{
            loadURL(win);
        }
    }
    load()
    win.webContents.on("did-fail-load", () => {
        console.log("Failed to load, retrying in 500ms");
        setTimeout(load, 500);
    })
    win.webContents.on('did-finish-load', () => {
        splash?.close();
        win.show();
        win.setIcon(path.join(paths.electronStatic, "/icons/512x512.png"))
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
    if (isWaifu2x && model !== "drawing") {
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
    ipc.handle("check-update", async () => {
        const version = app.getVersion()
        const remote = await request("https://raw.githubusercontent.com/Specy/Scapix/main/package.json").then(r => r.body.json()) as {version: string}
        const remoteVersion = remote?.version
        if(semver.gt(remoteVersion, version)){
            return "https://github.com/Specy/Scapix/releases/latest"
        }
        return null;
    })
    ipc.handle("get-waifu-models", async () => {
        const models = await fs.readdir(paths.models)
        models.unshift("drawing")
        return models;
    })
    ipc.handle("ask-directory", async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"]
        })
        return result.filePaths[0];
    })
    ipc.handle("open-dir", (e, dir: string) => {
        const isRelative = !path.isAbsolute(dir);
        if (isRelative) {
            dir = path.join(paths.root, dir);
        }
        shell.openPath(dir);   
    })
    ipc.on("goto-external", (e, url) => {
        shell.openExternal(url);
    })
    ipc.handle("halt-one-execution", (e, idOrFile: string | SerializedConversionFile) => {
        const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id;
        const file = pendingFiles.get(id);
        pendingFiles.delete(id);
        if (file) {
            console.log("Halted", file);
            win.webContents.send("file-status-change", file, { status: Status.Idle })
        }
    })
    ipc.handle("halt-all-executions", () => {
        for (const file of pendingFiles.values()) {
            win.webContents.send("file-status-change", file, { status: Status.Idle })
        }
        console.log("Halted all executions");
        pendingFiles.clear();
    })
    ipc.handle("execute-files", async (e, files: SerializedConversionFile[], globals: GlobalSettings, settings: SerializedSettings) => {
        pool.setCapacity(settings.maxConcurrentOperations);
        for (const file of files) {
            win.webContents.send("file-status-change", file, { status: Status.Waiting })
        }
        const out = settings.outputDirectory
        const promises = [];
        for (const file of files) {
            const opts = finalizeSettings(file.settings, globals, settings)
            console.log(opts)
            pendingFiles.set(file.id, file);
            promises.push(pool.add(async () => {
                if (!pendingFiles.get(file.id)) return; //stop if file was cancelled
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
                                    if (!pendingFiles.get(file.id)) {
                                        console.log("cancelled", file)
                                        return true;
                                    }
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, progress })
                                }
                            ); break;
                        case FileType.Video:
                            //TODO add progress
                            await Waifu2x.upscaleVideo(
                                file.path,
                                resultPath,
                                { ...opts, ffmpegPath: paths.ffmpeg, noResume: true },
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                    if (!pendingFiles.get(file.id)) {
                                        console.log("cancelled", file)
                                        return true;
                                    }
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                        case FileType.Gif:
                            //TODO add progress
                            await Waifu2x.upscaleGIF(
                                file.path,
                                resultPath,
                                {...opts, noResume: true },
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                     //stop if file was cancelled
                                    if (!pendingFiles.get(file.id)) {
                                        console.log("cancelled", file)
                                        return true;
                                    }
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                        case FileType.Webp:
                            //TODO add progress
                            await Waifu2x.upscaleAnimatedWebp(
                                file.path,
                                resultPath,
                                {...opts, noResume: true },
                                (currentFrame, totalFrames) => {
                                    console.log(`frame: ${currentFrame}/${totalFrames}`)
                                    if (!pendingFiles.get(file.id)) {
                                        console.log("cancelled", file)
                                        return true;
                                    }
                                    win.webContents.send("file-status-change", file, { status: Status.Converting, currentFrame, totalFrames })
                                }
                            ); break;
                    }
                    console.log("done", file)
                    if (!pendingFiles.get(file.id)) return console.log("file was cancelled", file);
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
function finalizePath(base: string, upscaleSettings: Waifu2xOptions, opts: PathOptions) {
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