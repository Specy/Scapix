import { app, BrowserWindow, ipcMain as ipc, protocol, dialog, shell } from "electron";
import url from "url";
import path from "path";
import { AsyncSemaphore, PATHS, ROOT_PATH } from "./utils";
import { DenoiseLevel, SerializedConversionFile, SerializedSettings, Status } from "./common/types/Files";
import Waifu2x from "waifu2x";
import fs from "fs/promises"
import serve from "electron-serve";
import { Waifu2xOptions } from "waifu2x";
import { request } from "undici";
import semver from "semver";
import log from "electron-log";
import { AppSchema, GlobalSettings, OptionalUpscaleSettings, SchemaType, UpscalerResult, upscalerHandler } from "./upscalers/upscalers.interface";
const isDev = !app.isPackaged


try {
    log.transports.file.resolvePath = () => path.join(ROOT_PATH, 'logs/main.log');
    Object.assign(console, log.functions)
    if (require('electron-squirrel-startup')) app.quit();
} catch (e) {
    console.error(e)
}
try {
    //require('electron-reloader')(module)
} catch (e) { }



const loadURL = serve({ directory: PATHS.svelteDist });

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
        icon: path.join(PATHS.electronStatic, "/icons/icon@2x.png"),
        frame: false,
    })
    splash.loadURL(
        `file://${path.join(PATHS.electronStatic, "/splash.html")}`
    )
    splash.on('closed', () => (splash = undefined));
    splash.webContents.on('did-finish-load', () => {
        splash?.show()
    });
}

let hasLoaded = false;
function createWindow() {
    console.log(path.join(PATHS.electronStatic, "/icons/icon@2x.png"))
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 720,
        minHeight: 720,
        title: "Scapix",
        backgroundColor: "#171A21",
        center: true,
        icon: path.join(PATHS.electronStatic, "/icons/icon@2x.png"),
        show: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(PATHS.electronClient, "/ipc/api.js")
        },
    });
    function load() {
        if (isDev) {
            win.loadURL("http://localhost:3123")
        } else {
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


function modelToPath(model: string) {
    return path.join(PATHS.models, model);
}

type PendingUpscale = {
    file: SerializedConversionFile;
    result?: UpscalerResult
}

function sendLog(type: "error" | "warn" | "log", message: string, timeout = 5000) {
    ipc.emit("log-to-renderer", { type, message, timeout })
}


function setUpIpc(win: BrowserWindow) {
    //all files that are either being converted or are queued to be converted
    const pendingFiles = new Map<string, PendingUpscale>();
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
        const remote = await request("https://raw.githubusercontent.com/Specy/Scapix/main/package.json").then(r => r.body.json()) as { version: string }
        const remoteVersion = remote?.version
        if (semver.gt(remoteVersion, version)) {
            return "https://github.com/Specy/Scapix/releases/latest"
        }
        return null;
    })
    ipc.handle("get-waifu-models", async () => {
        const models = await fs.readdir(PATHS.models)
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
        console.log(path.resolve(dir))
        const isRelative = !path.isAbsolute(dir);
        if (isRelative) {
            shell.openPath(path.resolve(path.join(PATHS.root, dir)));
        } else {
            shell.openPath(path.resolve(dir));
        }
    })
    ipc.on("goto-external", (e, url) => {
        shell.openExternal(url);
    })
    ipc.handle("get-upscalers-schema", async () => {
        return (await upscalerHandler.getSchemas()).unwrap() as AppSchema
    })
    ipc.handle("halt-one-execution", (e, idOrFile: string | SerializedConversionFile) => {
        const id = typeof idOrFile === "string" ? idOrFile : idOrFile.id;
        const file = pendingFiles.get(id);
        pendingFiles.delete(id);
        if (file) {
            console.log("Halted", file.file);
            file.result?.cancel()
            win.webContents.send("file-status-change", file.file, { status: Status.Idle })
        }
    })
    ipc.handle("halt-all-executions", () => {
        const files = pendingFiles.values();
        for (const file of files) {
            win.webContents.send("file-status-change", file.file, { status: Status.Idle })
            if (file.result) {
                console.log("Canceling: ", file.file.path)
                file.result.cancel()
            }
        }
        pendingFiles.clear();
        console.log("Halted all executions");
        Waifu2x.processes.forEach(p => p.kill("SIGINT"))
    })
    ipc.handle("execute-files", async (e, files: SerializedConversionFile[], globals: GlobalSettings, settings: SerializedSettings) => {
        pool.setCapacity(settings.maxConcurrentOperations);
        for (const file of files) {
            win.webContents.send("file-status-change", file, { status: Status.Waiting })
        }
        const out = settings.outputDirectory
        const promises: any = [];
        for (const file of files) {
            pendingFiles.set(file.id, { file });
            const el = pool.add(async () => {
                if (!pendingFiles.get(file.id)) return; //stop if file was cancelled
                win.webContents.send("file-status-change", file, { status: Status.Converting })
                try {
                    const options = upscalerHandler.mergeSettings(globals, file.settings, settings).unwrap()
                    console.log(`Upscaling file: "${file.path}" with options:`, options)
                    const initialPath = path.join(out, file.finalName)
                    const resultPath = finalizePath(initialPath, options, settings)
                    const result = await upscalerHandler.upscale(options.upscaler, file.type, initialPath, resultPath, options).unwrap()
                    pendingFiles.set(file.id, {
                        file,
                        result
                    });
                    result.onProgress((progress) => {
                        if (!pendingFiles.get(file.id)) return console.log("file was cancelled", file)
                        if (progress.type === "progress") {
                            win.webContents.send("file-status-change", file, {
                                status: Status.Converting,
                                progress: progress.progress
                            })
                        } else {
                            win.webContents.send("file-status-change", file, {
                                status: Status.Converting,
                                currentFrame: progress.current,
                                totalFrames: progress.total
                            })
                        }
                    })
                    const finalPath = (await result.result()).unwrap()
                    console.log(`Finished upscale of: "${file.path}"`)
                    if (!pendingFiles.get(file.id)) return console.warn(`File "${file.path}" was cancelled`)
                    win.webContents.send("file-status-change", file, { status: Status.Done, resultPath: finalPath })
                    pendingFiles.delete(file.id);
                } catch (e) {
                    win.webContents.send("file-status-change", file, { status: Status.Error, error: e })
                    console.error(e);
                    return;
                }
            })
            promises.push(el);
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
function finalizePath(base: string, upscaleSettings: { scale: number, upscaler: string, denoise: string }, opts: PathOptions) {
    //finalizes the path to the output file
    //Ex: "C:\Users\user\Downloads\image.png" -> "C:\Users\user\Downloads\{folder}\image.{options}.png"
    base = path.resolve(base)
    const { saveInDatedFolder, appendUpscaleSettingsToFileName } = opts;
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const suffix = `${upscaleSettings.upscaler}-${upscaleSettings.scale}x_${upscaleSettings.denoise}`;
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
app.on('window-all-closed', async () => {
    await upscalerHandler.dispose()
    if (process.platform !== 'darwin') app.quit()
})
function disposeAndQuit() {
    upscalerHandler.dispose()
    app.quit()
}
process.on('SIGINT', disposeAndQuit)
process.on('SIGTERM', disposeAndQuit)
process.on('SIGQUIT', disposeAndQuit)
app.whenReady().then(() => {
    loadSplash()
    createWindow()
    protocol.registerFileProtocol('resource', (request, callback) => {
        const filePath = url.fileURLToPath('file://' + request.url.slice('resource://'.length))
        callback(filePath)
    })
})