import React, { Component } from 'react'
import { Close, Remove, Tab, GitHub, Cached } from "@material-ui/icons"
import "../specy.css"
import "../App.css"
class TopMenu extends Component {
    constructor(props) {
        super(props)
        this.execFunction = (name, data) => {
            let toSend = {
                name: name,
                data: data
            }
            window.ipcRenderer.send("exec-function", toSend)
        }
    }

    //=======================================================//
    render() {
        return (
            <div className="menu">
                <div className="row alignY">
                    <Cached
                        style={{ margin: "0 0.2rem", fontSize: 20 }}
                        titleAccess="Reload"
                        onClick={() => this.execFunction("reload")}
                    />
                    <GitHub
                        style={{ margin: "0 1.3rem", marginTop: "0.1rem", fontSize: 17 }}
                        titleAccess="Open on github"
                        onClick={() => this.execFunction("open", "https://github.com/Specy-wot/Scapix")}
                    />
                </div>

                <div className="row alignY">
                    <Remove
                        style={{ marginLeft: "1rem", fontSize: 20 }}
                        titleAccess="Minimize"
                        onClick={() => this.execFunction("minimize")}
                    />
                    <Tab
                        style={{ marginLeft: "1rem", marginTop: "0.1rem", fontSize: 16 }}
                        titleAccess="Resize"
                        onClick={() => this.execFunction("resize")}
                    />
                    <Close
                        style={{ marginLeft: "1rem", fontSize: 20 }}
                        titleAccess="Close"
                        onClick={() => this.execFunction("close")}
                    />
                </div>
            </div>
        )
    }
}

export default TopMenu