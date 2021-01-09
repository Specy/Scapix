const exec = require("child_process").exec
const gifExtractor = require("gif-frames")
const fs = require('fs')
class AsyncWaifu2x {

    upscaleImg = (path, endPath, options) => {
        return new Promise(async (resolve, reject) => {
            try {
                let endFolder = endPath.split("/")
                endFolder.pop()
                endFolder = endFolder.join("/")
                endFolder = endFolder.replace("..", ".")
                if (!fs.existsSync(endFolder)) {
                    fs.mkdirSync(endFolder);
                }
                fs.unlinkSync(endPath.replace("..", "."))
            } catch (e) {
                console.log("File not existent")
            }

            let command = `cd ./waifu2x && waifu2x-converter-cpp.exe -i "${path}" -o "${endPath}"`
            if (options.noise) command += " --noise-level " + options.noise
            if (options.scale) command += " --scale-ratio " + options.scale
            console.log(command)
            exec(command, (err, stdout, stderr) => {
                let message
                if (err) {
                    message = {
                        output: stderr,
                        success: false
                    }
                } else {
                    message = {
                        output: stdout,
                        success: true
                    }
                }
                resolve(message)
            })
        })
    }
    upscaleGif = (path, tempPath, endPath, options) => {
        return new Promise(async (resolve, reject) => {
            let files = await fs.promises.readdir("./temp")
            for (const file of files) {
                await fs.promises.unlink("./temp/"+file)
            }
            let gifArr = await this.extractGifs(path, tempPath)
            let resultMsg = {
                output: "",
                success: true
            }
            endPath = endPath.replace(".gif", ".png") //momentary till i figure out how to put them back together
            //TODO FINISH GIF UPSCALING, REMEMBER THAT I NEED TO CHANGE THE PATH OF THE TEMP FILES TO BE IN TEMP/TEMP
            //OR 
            gifArr.forEach(async (file, i, a) => {
                let filePath = file.path
                let name = file.name
                let result = await this.upscaleImg(
                    "." + filePath,
                    "../results/" + options.dailyFolder + "/" + options.folderName + name,
                    options
                )
                if (!result.success) resultMsg = result
                if (i === a.length - 1) resolve(resultMsg)
            })
        })
    }


    extractGifs = (path, outputPath) => {
        return new Promise(async (resolve, reject) => {
            let promisesArr = []
            gifExtractor({ url: path, frames: "all" }).then(async (arr) => {
                arr.forEach(frame => {
                    promisesArr.push(new Promise((resolve, reject) => {
                        let picStream = fs.createWriteStream(outputPath + 'img-' + frame.frameIndex + '.png',);
                        frame.getImage().pipe(picStream)
                        picStream.on("close", () => {
                            let obj = {
                                path: outputPath + 'img-' + frame.frameIndex + '.png',
                                name: 'img-' + frame.frameIndex + '.png'
                            }
                            resolve(obj)
                        })
                    }))
                })
                let frames = await Promise.all(promisesArr)
                resolve(frames)
            })
        })

    }
    executeCommand = (command) => {
        return new Promise(async (resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr)
                } else {
                    resolve(stdout)
                }
            })
        })
    }
}

module.exports = new AsyncWaifu2x()