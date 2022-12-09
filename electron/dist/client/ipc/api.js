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
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var EventListeners = /** @class */ (function () {
    function EventListeners() {
        this.listeners = new Map();
    }
    EventListeners.generateId = function () {
        return Math.random().toString(36).substring(2, 9);
    };
    EventListeners.prototype.addListener = function (event, listener) {
        var _a;
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.push(listener);
    };
    EventListeners.prototype.removeListener = function (event, listener) {
        if (!this.listeners.has(event))
            return;
        var listeners = this.listeners.get(event);
        var index = listeners.findIndex(function (l) {
            if (typeof listener === "string")
                return l.id === listener;
            if (typeof listener === "function")
                return l.callback === listener;
            return l.id === listener.id;
        });
        if (index < 0)
            return;
        return listeners.splice(index, 1)[0];
    };
    return EventListeners;
}());
var eventListeners = new EventListeners();
var controls = {
    close: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.ipcRenderer.invoke("close")];
        });
    }); },
    minimize: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.ipcRenderer.invoke("minimize")];
        });
    }); },
    maximize: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.ipcRenderer.invoke("maximize")];
        });
    }); },
    toggleMaximize: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.ipcRenderer.invoke("toggleMaximize")];
        });
    }); },
    addOnMaximizationChange: function (callback) {
        var id = EventListeners.generateId();
        var listener = {
            id: id,
            callback: function (e, data) {
                console.log(e, data);
                callback(data);
            }
        };
        eventListeners.addListener("maximize-change", listener);
        electron_1.ipcRenderer.on("maximize-change", listener.callback);
        return id;
    },
    removeOnMaximizationChange: function (id) {
        var listener = eventListeners.removeListener("maximize-change", id);
        if (!listener)
            return;
        electron_1.ipcRenderer.removeListener("maximize-change", listener.callback);
    }
};
electron_1.contextBridge.exposeInMainWorld("controls", controls);
var api = {
    ping: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, electron_1.ipcRenderer.invoke("ping")];
        });
    }); }
};
electron_1.contextBridge.exposeInMainWorld("api", api);
