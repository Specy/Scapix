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
            <div className="dm-L2" style={{display:"flex"}}>
                {this.props.children.map((page,i) => {
					let isHidden = !(i === this.props.selectedPage)
					return <div style={isHidden ? {display:"none"}: {}} className="contentWrapper dm-L2">
						{page}
					</div>
				})}
            </div>
		)
	}
}

export default ContentWrapper