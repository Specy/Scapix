const waifu2x = require("waifu2x").default
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const fs = require('fs').promises
const fsSync = require('fs')
const sanitize = require("sanitize-filename")
const openExplorer = require('open-file-explorer');
const { shell } = require('electron')
const { dialog } = require('electron')
let globalOutput = {
    usesDefault: true,
    path: ""
}
ipcMain.on('open-folder', async (event, arg) => {
    let endPath = __dirname + "\\results"
    openExplorer(endPath)
})

ipcMain.on('change-dest', async (event,arg) =>{
    let path = await dialog.showOpenDialog({properties: ['openDirectory']})
    if(!path.canceled){
        globalOutput = {
            usesDefault: false,
            path: path.filePaths[0]
        }
    }
    event.reply('change-dest-answer',[true,globalOutput.path])
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
        if(el.endPath !== "default"){
            globalOutput = {
                usesDefault: false,
                path: el.endPath
            }
        }else{
            globalOutput.usesDefault = true
        }
        let options = {
            noise: noise,
            scale: el.scale,
            absolutePath: true,
        }
        let safeName = sanitize(el.name)
        let outputFile = replaceFormat(safeName, el.format)
        let date = new Date()
        let dailyFolder = + date.getDate() + "-" + date.getMonth()
        event.reply('update-execution', {
            id: el.id,
            status: "pending"
        })
        let output
        let endPath = __dirname + "/results/" + dailyFolder
            if(!globalOutput.usesDefault) endPath = globalOutput.path + "/" + dailyFolder
            endPath+= "/"
        if (!fsSync.existsSync(endPath)) {
            fsSync.mkdirSync(endPath,{recursive:true});
        }
        endPath += outputFile
        endPath = endPath.replace(/\//g,"\\")
        if (getFormat(el.name) === ".gif") {
            options.constraint = el.fps
            output = await waifu2x.upscaleGIF(el.path, endPath ,options)
        } else {
            output = await waifu2x.upscaleImage(el.path, endPath,options)
        }
        let reply = {
            id: el.id,
            message: output,
            success: true,
            status: "done",
            upscaledImg: null
        }
        try {
            if(getFormat(safeName) === ".gif") endPath += "/" + outputFile
            let upscaledImg = await fs.readFile( endPath, { encoding: "base64" })
            reply.upscaledImg = "data:image/" + getFormat(el.format, true) + ";base64," + upscaledImg

        } catch (e) {
            console.log("Error finding file ",e)
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
        icon: __dirname + "/icons/icon.png",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: __dirname+'/preload.js'
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
        icon: __dirname + "/icons/icon.png",
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

