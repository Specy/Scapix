import React, { Component } from 'react'
import MenuOption from "./MenuOption"
import { HomeRounded, Settings } from "@material-ui/icons"
import "../App.css"
import "../specy.css"
let st = {
    selected: {
        fontSize: 40,
        color: "white"
    },
    disabled: {
        fontSize: 40,
        color: "#7e7e7e"
    }
}
class SideMenu extends Component {
    constructor(props) {
        super(props)
    }

    //=======================================================//
    render() {
        let sel = this.props.selectedIndex
        let s = this.props.settings
        return (
            <div className={s.darkMode === "on" ? "sideMenu dm-L2" : "sideMenu dm-L1"}>
                <MenuOption index={0} action={this.props.action} settings={s}>
                    <HomeRounded style={sel === 0 ? st.selected : st.disabled} />
                </MenuOption>
                <MenuOption index={1} action={this.props.action} settings={s}>
                    <Settings style={sel === 1 ? st.selected : st.disabled} />
                </MenuOption>
            </div>
        )
    }
}

export default SideMenu