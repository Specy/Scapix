window.ipcRenderer = require('electron').ipcRenderer
const fs = require("fs").promises
window.package = require("./package.json")
window.Storage = class {
    constructor(){
        this.storage = null
    }
    get = async (key) => {
        if(this.storage === null) await this.populate()
        return this.storage[key]
    }
    set = async (key,value) => {
        if(this.storage === null) await this.populate()
        this.storage[key] = value
        try{
            await fs.writeFile("./Storage.json",JSON.stringify(this.storage)) 
        }catch(e){
            console.log(e)
            return false
        }
        return true
    }
    populate = async () => {
            let data = {}
            try{
                data = await fs.readFile("./Storage.json").then(data => JSON.parse(data))
            }catch(e){ console.log("NeverSaved")}
            this.storage = data
    }
}