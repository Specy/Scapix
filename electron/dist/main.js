"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_reloader_1 = __importDefault(require("electron-reloader"));
var url_1 = __importDefault(require("url"));
var path_1 = __importDefault(require("path"));
var isDev = !electron_1.app.isPackaged;
var base = path_1.default.join(__dirname, "../");
var paths = {
    svelteDist: path_1.default.join(base, "../client/build"),
    electronDist: path_1.default.join(base, "/dist"),
    electronClient: path_1.default.join(base, "/dist/client"),
    electronStatic: path_1.default.join(base, "/static")
};
try {
    (0, electron_reloader_1.default)(module);
}
catch (error) {
    console.log(error);
}
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        icon: path_1.default.join(paths.electronStatic, "/favicon.ico"),
        //show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path_1.default.join(paths.electronClient, "/ipc/api.js")
        },
    });
    if (isDev) {
        win.loadURL("http://localhost:3123");
    }
    else {
        win.loadFile(path_1.default.join(paths.svelteDist, "/index.html"));
    }
    setUpIpc(win);
}
function setUpIpc(win) {
    var _this = this;
    electron_1.ipcMain.handle("minimize", function () { return win.minimize(); });
    electron_1.ipcMain.handle("maximize", function () { return win.maximize(); });
    electron_1.ipcMain.handle("close", function () { return win.close(); });
    electron_1.ipcMain.handle("ping", function () { return "pong"; });
    electron_1.ipcMain.handle("toggle-maximize", function () {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    });
    electron_1.ipcMain.handle("ask-directory", function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, electron_1.dialog.showOpenDialog(win, {
                        properties: ["openDirectory"]
                    })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.filePaths[0]];
            }
        });
    }); });
    electron_1.ipcMain.on("goto-external", function (e, url) {
        electron_1.shell.openExternal(url);
    });
    win.on("maximize", function () { return win.webContents.send("maximize-change", true); });
    win.on("unmaximize", function () { return win.webContents.send("maximize-change", false); });
}
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.whenReady().then(function () {
    createWindow();
    electron_1.protocol.registerFileProtocol('resource', function (request, callback) {
        console.log(request);
        console.log(request.url);
        var filePath = url_1.default.fileURLToPath('file://' + request.url.slice('resource://'.length));
        callback(filePath);
    });
});
