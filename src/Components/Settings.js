import React, { Component } from 'react'
import "../App.css"
import "../specy.css"

class Settings extends Component {
    constructor(props) {
        super(props)
        window.ipcRenderer.on("change-dest-answer", (event, arg) => {
            if (arg[0]) {
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
            value = Boolean(el.checked) ? "on" : "off"
        }
        if (el.type === "number") value = Number(value)
        let obj = {
            type: el.name,
            value: value
        }
        this.props.toggleSettings(obj)
    }
    handleDialog = async () => {
        window.ipcRenderer.send("change-dest", "")
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
                        <button
                            className="button wm-L3"
                            onClick={this.handleDialog}
                        >
                            Click to select
                        </button>
                        <div style={{ marginLeft: "1rem" }}>
                            {s.outputPath}
                        </div>
                    </div>
                    <div className="settingRow">
                        <div className="settingsOption">Max upscales at a time</div>
                        <input
                            type="number"
                            className="input wm-L3 settingsNum"
                            onChange={this.handleSettingsChange}
                            value={s.maxUpscales}
                            step={1}
                            name="maxUpscales"
                        />
                    </div>
                    <div className="settingRow">
                        <div className="settingsOption">Max video/gif frames at a time </div>
                        <input
                            type="number"
                            className="input wm-L3 settingsNum"
                            onChange={this.handleSettingsChange}
                            step={1}
                            value={s.parallelFrames}
                            name="parallelFrames"
                        />
                        <div style={{ marginLeft: "1rem" }}>Higher = faster, but harder to compute</div>
                    </div>
                    <div style={{display:"none"}}>
                        <div className="advancedSettings">
                            Advanced settings
                        </div>
                        <div className="settingRow">
                            <div className="settingsOption">Use TTA</div>
                            <input
                                type="checkbox"
                                onChange={this.handleSettingsChange}
                                name="TTA"
                                checked={s.TTA === "on" ? true : false}
                            />
                        </div>
                        <div className="settingRow">
                            <div className="settingsOption">Block size</div>
                            <input
                                type="number"
                                className="input wm-L3 settingsNum"
                                onChange={this.handleSettingsChange}
                                step={1}
                                value={s.blockSize}
                                name="blockSize"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Settings