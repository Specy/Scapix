window.ipcRenderer = require('electron').ipcRenderer
const fs = require("fs").promises
console.log("INIT PRELOAD")
window.package = require("../package.json")


window.Storage = class {
    constructor() {
        this.storage = null
        this.populate()
    }
    get = async (key) => {
        if (this.storage === null) await this.populate()
        return this.storage[key]
    }
    set = async (key, value) => {
        if (this.storage === null) await this.populate()
        this.storage[key] = value
        try {
            await fs.writeFile(__dirname + "/Storage.json", JSON.stringify(this.storage))
        } catch (e) {
            console.log(e)
            return false
        }
        return true
    }
    populate = async () => {
        let data = {}
        try {
            data = await fs.readFile(__dirname + "/Storage.json").then(data => JSON.parse(data))
        } catch (e) { console.log("NeverSaved") }
        this.storage = data
    }
}
