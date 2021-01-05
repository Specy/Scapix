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
        floatingImages: {}
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
          <SideMenu action={this.changePage} selectedIndex={this.state.selectedPage}/>
          <ContentWrapper selectedPage = {this.state.selectedPage}>
              <MainPage toggleFloatingImages={this.toggleFloatingImages}/>
              <Settings/>
          </ContentWrapper>
        </div>
      </div>
    )}
}

// ========================================

ReactDOM.render(< App />, document.getElementById("root"))