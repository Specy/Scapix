// Modules to control application life and create native browser window
const {app, BrowserWindow , ipcMain, Menu } = require('electron')
const fs = require('fs').promises







ipcMain.on('send-images',async (event, arg) => {
    let promises = []
    let files = arg
    files.forEach((file,i) => {
        promises.push(fs.readFile(file.path,{encoding: 'base64'}))
    })
    let data = await Promise.all(promises)
    data = data.map((file,i) =>{
        return {
            data: file,
            id: files[i].id
        }
    })
    event.reply('receive-images', data)
  })








//---------------------------------------------------//


function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
        nodeIntegration: false,
        preload: __dirname + '/preload.js'
      }
  })
  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.maximize()
  //mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
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
