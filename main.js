const AsyncWaifu2x = require("./AsyncWaifu2x")
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const fs = require('fs').promises
const fsSync = require('fs')
const sanitize = require("sanitize-filename")
const openExplorer = require('open-file-explorer');
const { shell } = require('electron')
let globalOutput = "./results/"

ipcMain.on('open-folder', async (event, arg) => {
    let endPath = __dirname + "\\results"
    openExplorer(endPath)
})


ipcMain.on("exec-function", (event, data) => {
    switch (data.name) {
        case "close": {
            process.exit(1)
        }
        case "minimize": {
            mainWindow.minimize()
            break
        }
        case "open": {
            shell.openExternal(data.data)
            break
        }
        case "reload": {
            mainWindow.reload()
            break
        }
        case "resize": {
            mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
            break
        }
    }

})
ipcMain.on('execute-waifu', async (event, arg) => {
    arg.forEach(async el => {
        let noise = 0
        switch (el.noise) {
            case "Low": noise = 1
                break;
            case "Medium": noise = 2
                break;
            case "High": noise = 3
        }
        let options = {
            noise: noise,
            scale: el.scale
        }
        let safePath = sanitize(el.name)
        let outputPath = replaceFormat(safePath, el.format)
        let date = new Date()
        let dailyFolder = + date.getDate() + "-" + date.getMonth()
        if (!fsSync.existsSync(globalOutput + dailyFolder)) {
            fsSync.mkdirSync(globalOutput + dailyFolder);
        }
        event.reply('update-execution', {
            id: el.id,
            status: "pending"
        })
        let output
        if (getFormat(el.name) === ".gif") {
            options.width = el.width * el.scale
            options.height = el.height * el.scale
            options.folderName = "gif-" + getRandomId() + "/"
            options.dailyFolder = dailyFolder
            output = await AsyncWaifu2x.upscaleGif(
                el.path,
                "./temp/",
                "../results/" + dailyFolder + "/",
                options
            )
            output.isGif = true
        } else {
            output = await AsyncWaifu2x.upscaleImg(el.path, "../results/" + dailyFolder + "/" + outputPath, options)
        }

        let reply = {
            id: el.id,
            message: output.output,
            success: output.success,
            status: "done",
            upscaledImg: null
        }
        try {
            if (output.success) {
                let upscaledImg
                if (!output.isGif) {
                    upscaledImg = await fs.readFile("./results/" + dailyFolder + "/" + outputPath, { encoding: "base64" })
                } else {
                    upscaledImg = await fs.readFile(
                        "./results/" + dailyFolder + "/" + options.folderName + "img-0.png",
                        { encoding: "base64" }
                    )
                }
                reply.upscaledImg = "data:image/" + getFormat(outputPath, true) + ";base64," + upscaledImg
            }
        } catch (e) {
            console.log("Error finding file ")
            reply.success = false
        }

        event.reply('done-execution', reply)
    })
})

function getRandomId() {
    return Math.random().toString(36).substring(7)
}
//---------------------------------------------------//
function replaceFormat(path, newFormat) {
    if (newFormat === "Original") return path
    let regex = new RegExp('\.[^.\\\/:*?"<>|\r\n]+$')
    return path.replace(regex, newFormat)
}

function getFormat(path, noExtension = false) {
    let regex = new RegExp('\.[^.\\\/:*?"<>|\r\n]+$')
    let result = path.match(regex)[0] || ".png"
    if (noExtension) result = result.replace(".", "")
    return result
}
let mainWindow
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        alwaysOnTop: true,
        minHeight: screen.height,
        backgroundColor: "#7f7ba6",
        minWidth: 720,
        icon: "./public/icons/icon.png",
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        }
    })
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.maximize()
    mainWindow.on('closed', () => (mainWindow = null));
    mainWindow.webContents.on('did-finish-load', () => {
        if (splash) {
            splash.close();
        }
        mainWindow.show();
        setTimeout(() => {
            mainWindow.setAlwaysOnTop(false)
        }, 200)
    })
}
let splash
function loadSplash() {
    splash = new BrowserWindow({
        width: screen.width,
        height: screen.height,
        minWidth: screen.width,
        minHeight: screen.height,
        icon: "./public/icons/icon.png",
        frame: false,
        alwaysOnTop: true
    })
    splash.loadURL(
        'file://' + __dirname + '/splash.html'
    )
    splash.on('closed', () => (splash = false));
    splash.webContents.on('did-finish-load', () => {
        splash.show()
        splash.maximize()
    });
}
app.whenReady().then(() => {
    loadSplash()
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

