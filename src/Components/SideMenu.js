import React, { Component } from 'react'
import MenuOption from "./MenuOption"
import { HomeRounded, Settings } from "@material-ui/icons"
import "../App.css"
import "../specy.css"
let s = {
    selected:{
        fontSize:40,
        color:"white"
    },
    disabled:{
        fontSize:40,
        color:"#7e7e7e"
    }
}
class SideMenu extends Component {
	constructor(props) {
		super(props)
    }
    
	//=======================================================//
	render() {
        let sel = this.props.selectedIndex
		return (
        <div className="sideMenu dm-L1">
                <MenuOption index={0} action={this.props.action}>
                    <HomeRounded style={sel === 0 ? s.selected : s.disabled}/>
                </MenuOption>
                <MenuOption index={1} action={this.props.action}>
                    <Settings style={sel === 1 ? s.selected : s.disabled}/>
                </MenuOption>
          </div>
		)
	}
}

export default SideMenu