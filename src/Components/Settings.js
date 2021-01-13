import React, { Component } from 'react'
import "../App.css"
import "../specy.css"

class Settings extends Component {
    constructor(props) {
        super(props)
        window.ipcRenderer.on("change-dest-answer",(event,arg)=>{
            if(arg[0]){
                let obj = {
                    type: "outputPath",
                    value: arg[1]
                }
                this.props.toggleSettings(obj)
            }
        })
    }
    handleSettingsChange = (e) => {
        let el = e.target
        let value = el.value
        if (el.type === "checkbox") {
            let checked = Boolean(el.checked)
            value = checked ? "on" : "off"
        }
        let obj = {
            type: el.name,
            value: value
        }
        this.props.toggleSettings(obj)
    }
    handleDialog = async () =>{
        window.ipcRenderer.send("change-dest","")
    }
    //=======================================================//
    render() {
        let s = this.props.settings
        return (
            <div className={s.darkMode === "on" ? "content dm-L1" : "content l1"}>
                <div className={s.darkMode === "on" ? "settingsContainer dm-L2" : "settingsContainer box-shadow"}>
                    <div className="settingRow">
                        <div className="settingsOption">Dark mode</div>
                        <input
                            type="checkbox"
                            onChange={this.handleSettingsChange}
                            name="darkMode"
                            checked={s.darkMode === "on" ? true : false}
                        />
                    </div>
                    <div className="settingRow">
                        <div className="settingsOption">Output path</div>
                        <button className="button" onClick={this.handleDialog}>Click to select</button>
                        <div>{s.outputPath}</div>
                    </div>
                    <div className="settingRow">
                        More to come...
                    </div>
                </div>
            </div>
        )
    }
}

export default Settings