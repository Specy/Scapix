"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_reloader_1 = __importDefault(require("electron-reloader"));
var path_1 = __importDefault(require("path"));
var isDev = !electron_1.app.isPackaged;
var paths = {
    svelteDist: path_1.default.join(__dirname, "../client/build"),
    electronDist: path_1.default.join(__dirname, "/dist"),
    electronClient: path_1.default.join(__dirname, "/client"),
};
try {
    (0, electron_reloader_1.default)(module);
}
catch (error) {
    console.log(error);
}
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 1400,
        height: 1400,
        //transparent: true,
        //frame: false,
        //show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path_1.default.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if (isDev) {
        win.loadURL("http://localhost:3123");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(paths.svelteDist, "/index.html"));
    }
}
electron_1.ipcMain.handle("ping", function () { return "pong"; });
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.whenReady().then(function () {
    createWindow();
});
