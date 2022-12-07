import { BrowserWindow, app } from "electron";
import electronReloader from "electron-reloader";

try{
    electronReloader(module);
} catch (error) {
    console.log(error);
}
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadURL("http://localhost:3123");
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
})

