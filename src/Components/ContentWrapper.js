import React, { Component } from 'react'

import "../App.css"
import "../specy.css"
class ContentWrapper extends Component {
	constructor(props) {
        super(props)
    }
    
	//=======================================================//
	render() {
		let s = this.props.settings
		return (
            <div style={{display:"flex"}}>
                {this.props.children.map((page,i) => {
					let isHidden = !(i === this.props.selectedPage)
					return <div style={isHidden ? {display:"none"}: {}} className="contentWrapper" key={i}>
						{page}
					</div>
				})}
            </div>
		)
	}
}

export default ContentWrapper