import React, { Component } from 'react'
import "../App.css"
import { Close } from "@material-ui/icons"
class FloatingImages extends Component {
	constructor(props) {
		super(props)
    }
    preventDefault = (e) =>{
        e.preventDefault()
        e.stopPropagation()
    }
	//=======================================================//
	render() {
        let shown = this.props.toggled ? "flex" : "none"
		return (
            <div 
                className="floatingImages" 
                style={{display: shown}}
                onClick={this.props.toggle}
            >
                <Close 
                    className="closeBtn" 
                    style={{fontSize:45}} 
                    onClick={this.props.toggle}
                />
                <div 
                    className="imagesContainer"
                    onClick={this.preventDefault}
                >
                    <div className="textAndImage">
                        <div className="floatingImgText">Original</div>
                        <img src={this.props.data.original}/>
                    </div>
                    <div className="textAndImage">
                        <div className="floatingImgText">Modified</div>
                        <img src={this.props.data.modified}/>
                    </div>
                    
                </div>
            </div>
		)
	}
}

export default FloatingImages