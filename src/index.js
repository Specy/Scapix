import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import "./specy.css"
import "./App.css"
import SideMenu from "./Components/SideMenu"
import ContentWrapper from "./Components/ContentWrapper"
import MainPage from "./Components/MainPage"
import Settings from "./Components/Settings"
class App extends Component {
    constructor() {
      super()
      this.state = {
        selectedPage: 0
      }
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
          <SideMenu action={this.changePage} selectedIndex={this.state.selectedPage}/>
          <ContentWrapper selectedPage = {this.state.selectedPage}>
              <MainPage/>
              <Settings/>
          </ContentWrapper>
        </div>
      </div>
    )}
}

// ========================================

ReactDOM.render(< App />, document.getElementById("root"))