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
        while (_) try {
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
exports.__esModule = true;
var child_process_1 = require("child_process");
var fs = require("fs");
var image_size_1 = require("image-size");
var path = require("path");
var Waifu2x = /** @class */ (function () {
    function Waifu2x() {
    }
    Waifu2x.parseFilename = function (source, dest, rename) {
        var _a = ["", ""], image = _a[0], folder = _a[1];
        if (!dest) {
            image = null;
            folder = null;
        }
        else if (path.basename(dest).includes(".")) {
            image = path.basename(dest);
            folder = dest.replace(image, "");
        }
        else {
            image = null;
            folder = dest;
        }
        if (!folder)
            folder = "./";
        if (folder.endsWith("/"))
            folder = folder.slice(0, -1);
        if (!image) {
            if (source.slice(-3).startsWith(".")) {
                image = "" + path.basename(source).slice(0, -3) + rename + source.slice(-3);
            }
            else if (source.slice(-4).startsWith(".")) {
                image = "" + path.basename(source).slice(0, -4) + rename + source.slice(-4);
            }
            else {
                image = "" + path.basename(source).slice(0, -5) + rename + source.slice(-5);
            }
        }
        return { folder: folder, image: image };
    };
    Waifu2x.recursiveRename = function (folder, fileNames, rename) {
        if (folder.endsWith("/"))
            folder = folder.slice(0, -1);
        for (var i = 0; i < fileNames.length; i++) {
            var fullPath = folder + "/" + fileNames[i];
            var check = fs.statSync(fullPath);
            if (check.isDirectory()) {
                var subFiles = fs.readdirSync(fullPath);
                Waifu2x.recursiveRename(fullPath, subFiles, rename);
            }
            else {
                var pathSplit = fileNames[i].split(".");
                var newName = pathSplit[0].split("_")[0] + rename;
                var newPath = folder + "/" + newName + "." + pathSplit.pop();
                fs.renameSync(fullPath, newPath);
            }
        }
    };
    Waifu2x.upscaleImage = function (source, dest, options) {
        if (!options)
            options = {};
        if (!options.rename)
            options.rename = "2x";
        var _a = Waifu2x.parseFilename(source, dest, options.rename), folder = _a.folder, image = _a.image;
        if (!fs.existsSync(folder))
            fs.mkdirSync(folder, { recursive: true });
        var absolute = path.join(__dirname, "..", "waifu2x");
        var local;
        if (__dirname.includes("node_modules")) {
            local = path.join(__dirname, "../../../");
        }
        else {
            local = path.join(__dirname, "..");
        }
        var sourcePath = path.join(local, source);
        var destPath = path.join(local, folder, image);
        var program = "cd " + absolute + "/ && waifu2x-converter-cpp.exe";
        if (options.callFromPath)
            program = "waifu2x-converter-cpp";
        var command = program + " -i \"" + sourcePath + "\" -o \"" + destPath + "\" -s";
        if (options.noise)
            command += " --noise-level " + options.noise;
        if (options.scale)
            command += " --scale-ratio " + options.scale;
        if (options.pngCompression)
            command += " -c " + options.pngCompression;
        if (options.jpgWebpQuality)
            command += " -q " + options.jpgWebpQuality;
        return child_process_1.execSync(command).toString();
    };
    Waifu2x.upscaleImages = function (sourceFolder, destFolder, options) {
        if (!options)
            options = {};
        if (!options.rename)
            options.rename = "2x";
        if (!fs.existsSync(destFolder))
            fs.mkdirSync(destFolder, { recursive: true });
        if (!options.recursion)
            options.recursion = 1;
        var absolute = path.join(__dirname, "..", "waifu2x");
        var local;
        if (__dirname.includes("node_modules")) {
            local = path.join(__dirname, "../../../");
        }
        else {
            local = path.join(__dirname, "..");
        }
        var sourcePath = path.join(local, sourceFolder);
        var destPath = path.join(local, destFolder);
        var program = "cd " + absolute + " && waifu2x-converter-cpp.exe";
        if (options.callFromPath)
            program = "waifu2x-converter-cpp";
        var command = program + " -i \"" + sourcePath + "\" -o \"" + destPath + "\" -r " + options.recursion + " -s";
        if (options.noise)
            command += " --noise-level " + options.noise;
        if (options.scale)
            command += " --scale-ratio " + options.scale;
        if (options.pngCompression)
            command += " -c " + options.pngCompression;
        if (options.jpgWebpQuality)
            command += " -q " + options.jpgWebpQuality;
        if (options.recursionFormat)
            command += " -f " + options.recursionFormat.toUpperCase();
        var output = child_process_1.execSync(command).toString();
        var files = fs.readdirSync(destFolder);
        Waifu2x.recursiveRename(destFolder, files, options.rename);
        return output;
    };
    Waifu2x.encodeGif = function (files, dest) { return __awaiter(void 0, void 0, void 0, function () {
        var GifEncoder, getPixels;
        return __generator(this, function (_a) {
            GifEncoder = require("gif-encoder");
            getPixels = require("get-pixels");
            return [2 /*return*/, new Promise(function (resolve) {
                    var dimensions = image_size_1.imageSize(files[0]);
                    var gif = new GifEncoder(dimensions.width, dimensions.height);
                    var pathIndex = files[0].search(/\d{8,}/);
                    var pathDir = files[0].slice(0, pathIndex);
                    if (!dest)
                        dest = "" + pathDir + files[0].match(/(?<=\/)(\d{8,})(?=\/)/)[0] + ".gif";
                    var file = fs.createWriteStream(dest);
                    gif.pipe(file);
                    gif.setQuality(20);
                    gif.setDelay(0);
                    gif.setRepeat(0);
                    gif.writeHeader();
                    var counter = 0;
                    var addToGif = function (frames) {
                        getPixels(frames[counter], function (err, pixels) {
                            gif.addFrame(pixels.data);
                            gif.read();
                            if (counter >= frames.length - 1) {
                                gif.finish();
                            }
                            else {
                                counter++;
                                addToGif(files);
                            }
                        });
                    };
                    addToGif(files);
                    gif.on("end", function () {
                        resolve();
                    });
                })];
        });
    }); };
    Waifu2x.awaitStream = function (writeStream) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                })];
        });
    }); };
    Waifu2x.upscaleGIF = function (source, dest, constraint) { return __awaiter(void 0, void 0, void 0, function () {
        function downloadFrames(frames) {
            return __awaiter(this, void 0, void 0, function () {
                var promiseArray, i, writeStream;
                return __generator(this, function (_a) {
                    promiseArray = [];
                    for (i = 0; i < frames.length; i += step) {
                        writeStream = fs.createWriteStream(frameDest + "/frame" + i + ".jpg");
                        frames[i].getImage().pipe(writeStream);
                        frameArray.push(frameDest + "/frame" + i + ".jpg");
                        promiseArray.push(Waifu2x.awaitStream(writeStream));
                    }
                    return [2 /*return*/, Promise.all(promiseArray)];
                });
            });
        }
        var gifFrames, frames, _a, folder, image, frameDest, step, frameArray, upScaleDest, scaledFrames, newFrameArray;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gifFrames = require("gif-frames");
                    return [4 /*yield*/, gifFrames({ url: source, frames: "all" })];
                case 1:
                    frames = _b.sent();
                    _a = Waifu2x.parseFilename(source, dest, "2x"), folder = _a.folder, image = _a.image;
                    frameDest = folder + "/" + path.basename(source.slice(0, -4)) + "Frames";
                    if (!fs.existsSync(frameDest))
                        fs.mkdirSync(frameDest, { recursive: true });
                    step = 1;
                    if (constraint && (constraint !== Infinity))
                        step = Math.ceil(frames.length / constraint);
                    frameArray = [];
                    return [4 /*yield*/, downloadFrames(frames)];
                case 2:
                    _b.sent();
                    upScaleDest = frameDest + "/upscaled";
                    if (!fs.existsSync(upScaleDest))
                        fs.mkdirSync(upScaleDest, { recursive: true });
                    Waifu2x.upscaleImages(frameDest, upScaleDest);
                    scaledFrames = fs.readdirSync(upScaleDest);
                    newFrameArray = scaledFrames.map(function (f) { return upScaleDest + "/" + f; });
                    return [4 /*yield*/, Waifu2x.encodeGif(newFrameArray, folder + "/" + image)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    Waifu2x.upscaleGifs = function (sourceFolder, destFolder, constraint, limit) { return __awaiter(void 0, void 0, void 0, function () {
        var files, fileMap, i;
        return __generator(this, function (_a) {
            files = fs.readdirSync(sourceFolder);
            if (sourceFolder.endsWith("/"))
                sourceFolder = sourceFolder.slice(0, -1);
            fileMap = files.map(function (file) { return sourceFolder + "/" + file; });
            if (!limit)
                limit = fileMap.length;
            for (i = 0; i < limit; i++) {
                if (!fileMap[i])
                    return [2 /*return*/];
                try {
                    Waifu2x.upscaleGIF(fileMap[i], destFolder, constraint);
                }
                catch (err) {
                    continue;
                }
            }
            return [2 /*return*/];
        });
    }); };
    return Waifu2x;
}());
exports["default"] = Waifu2x;
module.exports["default"] = Waifu2x;
