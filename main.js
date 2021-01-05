const AsyncWaifu2x =require("./AsyncWaifu2x")
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const fs = require('fs').promises
const sanitize = require("sanitize-filename")



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
        safePath = safePath.replace(/ /g,"")
        await fs.copyFile(el.path,"./results/"+safePath)
        event.reply('update-execution', {
            id:el.id,
            status: "pending"
        })
        let output = await AsyncWaifu2x.upscaleImg("../results/"+safePath,"../results/"+safePath,options)
        let reply = {
            id:el.id,
            message: output.output,
            success: output.success,
            status: "done",
            upscaledImg: null
        }
        if(output.success){
            let upscaledImg = await fs.readFile("./results/"+safePath, {encoding: "base64"})
            reply.upscaledImg = "data:image/"+getFormat(safePath,true)+";base64,"+upscaledImg
        }
        event.reply('done-execution', reply)
    })
})

//---------------------------------------------------//

function getFormat(path,noExtension  = false){
    let regex = new RegExp('\.[^.\\\/:*?"<>|\r\n]+$')
    let result = path.match(regex)[0] || ".png"
    if(noExtension) result = result.replace(".","")
    return result
}
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 1000,
        alwaysOnTop:true,
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
        },500)
      });

    //mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let splash
function loadSplash(){
    splash = new BrowserWindow({
        width: 1200, 
        height: 1000, 
        frame: false, 
        alwaysOnTop: true
    })
    splash.setResizable(false);
    splash.loadURL(
      'file://' + __dirname + '/splash.html'
    )
    splash.maximize()
    splash.on('closed', () => (loadingScreen = null));
    splash.webContents.on('did-finish-load', () => {
        splash.show();
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
