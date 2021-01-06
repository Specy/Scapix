const exec = require("child_process").exec
const gifExtractor = require("gif-frames")
const waifu2x = require("./waifu2x").default
const GIFEncoder = require('gifencoder');
const fs = require('fs')
class  AsyncWaifu2x{

    upscaleImg =  (path, endPath, options) => {
        return new Promise(async (resolve, reject) => {

            try{
                fs.unlinkSync(endPath)
            }catch(e){
                console.log("File not existent")
            }

            let command = `cd ./waifu2x && waifu2x-converter-cpp.exe -i ${path} -o .${endPath}`
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
    upscaleGif =  (path,tempPath,endPath,options) =>{
        return new Promise(async (resolve,reject)=>{
            let gifArr = await this.extractGifs(path,tempPath)
            let hadErr = false
            //TODO the upscaleImg function deletes the temp images because they are in the
            //same folder as the output files, i need to create a temp2 folder inside the temp
            //folder to save the upscaled images
            gifArr.forEach(async path =>{
                let result = await this.upscaleImg("."+path,path,options)
                if(!result.success) hadErr = true
            })
            await waifu2x.encodeGif(gifArr,endPath)
            let message = {
                output: "",
                success: true
            }
            resolve(message)
        })
    }
    
    
    extractGifs = (path,tempPath) => {
        return new Promise(async (resolve,reject) =>{
            let promisesArr = []
            gifExtractor({url:path,frames:"all"}).then(async (arr)=>{
                arr.forEach(frame =>{
                    promisesArr.push(new Promise((resolve,reject)=>{
                        let picStream = fs.createWriteStream(tempPath+'img-' + frame.frameIndex + '.png',);
                        frame.getImage().pipe(picStream)
                        picStream.on("close",() =>{
                            resolve(tempPath+'img-' + frame.frameIndex + '.png')
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