const AsyncWaifu2x =require("./AsyncWaifu2x")
const { app, BrowserWindow, ipcMain,screen } = require('electron')
const fs = require('fs').promises
const fsSync = require('fs')
const sanitize = require("sanitize-filename")
const openExplorer = require('open-file-explorer');
const { shell } = require('electron')

let globalOutput = "./results/"
ipcMain.on('open-folder', async (event, arg) => {
    let endPath = __dirname+"\\results"
    console.log(endPath)
    openExplorer(endPath)
})

ipcMain.on("exec-function",(event, data) =>{
    console.log(data.name)
    switch(data.name){
        case "close":{
            process.exit(1)
            break
        }
        case "minimize":{
            mainWindow.minimize()
            break
        }
        case "github":{
            shell.openExternal('https://github.com/Specy-wot/Scapix')
            break
        }
        case "reload":{
            mainWindow.reload()
            break
        }
        case "resize":{
            console.log("resized")
            mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
            break
        }
    }

})
ipcMain.on('execute-waifu', async (event, arg) => {
    arg.forEach(async el =>{
        let noise = 0
        switch(el.noise){
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
        let outputPath = replaceFormat(safePath,el.format)
        let date = new Date()
        let dailyFolder = + date.getDate() +"-"+ date.getMonth()
        if (!fsSync.existsSync(globalOutput+dailyFolder)){
            fsSync.mkdirSync(globalOutput+dailyFolder);
        }
        event.reply('update-execution', {
            id:el.id,
            status: "pending"
        })
        let output
        if(getFormat(el.name) === ".gif"){
            options.width = el.width * el.scale
            options.height = el.height * el.scale
            output = await AsyncWaifu2x.upscaleGif(el.path,"../temp/","../results/"+dailyFolder+"/"+outputPath,options)
        }else{
            output = await AsyncWaifu2x.upscaleImg(el.path,"../results/"+dailyFolder+"/"+outputPath,options)
        }
        
        let reply = {
            id:el.id,
            message: output.output,
            success: output.success,
            status: "done",
            upscaledImg: null
        }
        if(!output.success) console.log(output.output)
        try{
            if(output.success){
                let upscaledImg = await fs.readFile("./results/"+dailyFolder+"/"+outputPath, {encoding: "base64"})
                reply.upscaledImg = "data:image/"+getFormat(outputPath,true)+";base64,"+upscaledImg
            }
        }catch(e){
            console.log("Error finding file")
            output.success = false
        }

        event.reply('done-execution', reply)
    })
})

//---------------------------------------------------//
function replaceFormat(path,newFormat){
    if(newFormat === "Original") return path
    let regex = new RegExp('\.[^.\\\/:*?"<>|\r\n]+$')
    return path.replace(regex,newFormat)
}

function getFormat(path,noExtension  = false){
    let regex = new RegExp('\.[^.\\\/:*?"<>|\r\n]+$')
    let result = path.match(regex)[0] || ".png"
    if(noExtension) result = result.replace(".","")
    return result
}
let mainWindow
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        alwaysOnTop:true,
        minHeight: screen.height,
        backgroundColor: "#7f7ba6",
        minWidth: 720,
        icon: "./public/icons/icon.png",
        frame:false,
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        }
    })
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.maximize()
    mainWindow.webContents.on('did-finish-load', () => {
        /// then close the loading screen window and show the main window
        if (splash) {
          splash.close();
        }
        mainWindow.show();
        setTimeout(()=>{
            mainWindow.setAlwaysOnTop(false)
        },200)
      });

    //mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let splash
function loadSplash(){
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
    splash.on('closed', () => (loadingScreen = null));
    splash.webContents.on('did-finish-load', () => {
        splash.show()
        splash.maximize()
    });
}
app.whenReady().then(() => {
    loadSplash()
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
