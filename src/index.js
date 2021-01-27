import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import "./specy.css"
import "./App.css"
import SideMenu from "./Components/SideMenu"
import ContentWrapper from "./Components/ContentWrapper"
import MainPage from "./Components/MainPage"
import Settings from "./Components/Settings"
import FloatingImages from "./Components/FloatingImages"
import FloatingMessage from "./Components/FloatingMessage"
import TopMenu from "./Components/TopMenu"
const Storage = new window.Storage()
class App extends Component {
  constructor() {
    super()
    this.state = {
      selectedPage: 0,
      floatingImagesToggled: false,
      floatingImages: {},
      settings: {
        darkMode: "off",
        outputPath: "default",
        maxUpscales: 4
      },
      floatingMessage:{
        message: "",
        isShown: false,
        type: ""
      }
    }
    window.ipcRenderer.on("log-error",(event,arg)=>{
      console.log("Error in main thread: ")
      console.error(arg)
      this.showMessage(arg.toString(),1,4000)
    })
    window.showMessage = this.showMessage
    this.checkUpdate()
    this.populateStorage()
  }
  toggleFloatingImages = (data) => {
    if (!data.hasImages) {
      data = {
        original: "",
        format: 0,
        updated: ""
      }
    }
    this.setState({
      floatingImagesToggled: !this.state.floatingImagesToggled,
      floatingImages: data
    })
  }
  showMessage = (text,type,timeout = 4000,action) =>{
    if(typeof action !== "function") action = () => {}
    let newState = {
      message: text,
      isShown: true,
      type: type,
      action: action
    }
    setTimeout(()=>{
      let newState = this.state.floatingMessage
      newState.isShown = false
      this.setState({
        floatingMessage : newState
      })
    },timeout)
    this.setState({
      floatingMessage : newState,
    })
  }
  
  checkUpdate = async () => {
		let data = await fetch("https://raw.githubusercontent.com/Specy-wot/Scapix/main/package.json").then(data => data.json())
		if (data.version !== window.package.version) {
      let action = () => {
        let toExec = {
          data:"https://github.com/Specy-wot/Scapix",
          name: "open"
        }
        window.ipcRenderer.send("exec-function",toExec)
      }
      this.showMessage("There is an update available! Click to View",1,10000,action)
		} else {
			console.log("No update")
		}
  }

  populateStorage = async () =>{
    let data = await Storage.get("settings")
    if(data){
      this.setState({
        settings: data
      })
    }
  }

  toggleSettings = async (data) => {
    let newState = this.state.settings
    newState[data.type] = data.value
    this.setState({
      settings: newState
    })
    await Storage.set("settings",newState)
  }
  changePage = (index) => {
    this.setState({
      selectedPage: index
    })
  }
  render() {
    return (
      <div className="body">
        <TopMenu/>
        <FloatingMessage data={this.state.floatingMessage}/>
        <div className="appWrapper">
          <FloatingImages
            toggled={this.state.floatingImagesToggled}
            toggle={this.toggleFloatingImages}
            data={this.state.floatingImages}
          />
          <SideMenu action={this.changePage} selectedIndex={this.state.selectedPage} settings={this.state.settings} />
          <ContentWrapper selectedPage={this.state.selectedPage} settings={this.state.settings}>
            <MainPage toggleFloatingImages={this.toggleFloatingImages} settings={this.state.settings} />
            <Settings toggleSettings={this.toggleSettings} settings={this.state.settings} />
          </ContentWrapper>
        </div>
      </div>
    )
  }
}

// ========================================

ReactDOM.render(< App />, document.getElementById("root"))