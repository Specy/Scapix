import React, { Component } from 'react'

import "../App.css"
import "../specy.css"
class ContentWrapper extends Component {
	constructor(props) {
        super(props)
    }
    
	//=======================================================//
	render() {
		return (
            <div className="contentWrapper dm-L2">
                {this.props.children[this.props.selectedPage]}
            </div>
		)
	}
}

export default ContentWrapper