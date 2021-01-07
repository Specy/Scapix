import React, { Component } from 'react'
import "../App.css"
import "../specy.css"
class Settings extends Component {
    constructor(props) {
        super(props)
    }  
    handleSettingsChange = (e) =>{

        let el = e.target
        let value = el.value
        if(el.type === "checkbox"){
            let checked = Boolean(el.checked)
            value = checked ? "on" : "off"
        }
        let obj = {
            type: el.name,
            value: value
        }
        this.props.toggleSettings(obj)
    }
    //=======================================================//
    render() {
        let s = this.props.settings
        return (
            <div className={s.darkMode === "on" ? "content dm-L1" : "content l1"  }>
                <div className={s.darkMode === "on" ? "settingsContainer dm-L2" : "settingsContainer box-shadow"  }>
                    <div className="row centerY">
                        <div className="settingsOption">Dark mode</div>
                        <input 
                            type="checkbox"
                            onChange={this.handleSettingsChange}
                            name="darkMode"
                            checked={s.darkMode === "on" ? true : false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default Settings