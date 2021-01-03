import React, { Component } from 'react'
import "../App.css"
import { DeleteForever } from "@material-ui/icons"
class ComponentEx extends Component {
	constructor(props) {
		super(props)
    }
    
	//=======================================================//
	render() {
		return (
            <div className="fileRow">
                <div>
                    {this.props.children}
                </div>
                <div>
                    <DeleteForever 
                        onClick={() => this.props.action(this.props.children)}
                        className="text-red"
                    />
                </div>
            </div>
		)
	}
}

export default ComponentEx