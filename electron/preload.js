window.ipcRenderer = require('electron').ipcRenderer
const fs = require("fs").promises
console.log("INIT PRELOAD")
window.package = require("../package.json")


window.Storage = class {
    constructor() {
        this.storage = null
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

/*
New storage
class Storage {
  constructor(storage) {
    this.storage = storage
  }

  get(key) {
    // safe to call this.storage here without checking because your constructor guarantees its initialization
  }

  async static create() {
    const data = await fs.promises.readFile(...)
    return new this(data)
  }
}

const storage = await Storage.create()


*/