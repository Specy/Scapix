import React, { Component } from 'react'
import "../App.css"
let s = {
    wrapper:{
        borderRadius: "0.5rem",
        width:"3.5vw",
        height:"3.5vw",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        marginTop:"1rem"
    }

}
class MenuOption extends Component {
	constructor(props) {
        super(props)
    }
	//=======================================================//
	render() {
		return (
            <div style={s.wrapper} className="dm-L2" onClick={() => this.props.action(this.props.index)}>
                {this.props.children}
            </div>
		)
	}
}

export default MenuOption