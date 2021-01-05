const exec = require("child_process").exec

let AsyncWaifu2x = {

    upscaleImg: (path, endPath, options) => {
        return new Promise(async (resolve, reject) => {
            let command = `cd ./waifu2x && waifu2x-converter-cpp.exe -i ${path} -o ${endPath}`
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
    },
    executeCommand: (command) => {
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

module.exports = AsyncWaifu2x