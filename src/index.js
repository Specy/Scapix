import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import "./specy.css"
import "./App.css"
import SideMenu from "./Components/SideMenu"
import ContentWrapper from "./Components/ContentWrapper"
import MainPage from "./Components/MainPage"
import Settings from "./Components/Settings"
import FloatingImages from "./Components/FloatingImages"
class App extends Component {
    constructor() {
      super()
      this.state = {
        selectedPage: 0,
        floatingImagesToggled: false,
        floatingImages: {},
        settings:{
          darkMode:"off"
        }
      }
    }
    toggleFloatingImages = (data) =>{
      if(!data.hasImages){
        data = {
          original: "",
          updated: ""
        }
      }
      this.setState({
        floatingImagesToggled : !this.state.floatingImagesToggled,
        floatingImages: data
      })
    }
    toggleSettings = (data) =>{
      let newState = this.state.settings
      newState[data.type] = data.value
      this.setState({
        settings: newState
      })
    }
    changePage = (index) => {
      this.setState({
        selectedPage: index
      })
    }
    render() {
      return (
      <div className="body">
        <div className="appWrapper">
          <FloatingImages 
            toggled={this.state.floatingImagesToggled} 
            toggle={this.toggleFloatingImages}
            data={this.state.floatingImages}
          />
          <SideMenu action={this.changePage} selectedIndex={this.state.selectedPage} settings={this.state.settings}/>
          <ContentWrapper selectedPage = {this.state.selectedPage} settings={this.state.settings}>
              <MainPage toggleFloatingImages={this.toggleFloatingImages} settings={this.state.settings}/>
              <Settings toggleSettings={this.toggleSettings} settings={this.state.settings}/>
          </ContentWrapper>
        </div>
      </div>
    )}
}

// ========================================

ReactDOM.render(< App />, document.getElementById("root"))