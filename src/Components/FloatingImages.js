import React, { Component } from 'react'
import "../App.css"
import { Close } from "@material-ui/icons"
class FloatingImages extends Component {
    constructor(props) {
        super(props)
    }
    preventDefault = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }
    //=======================================================//
    render() {
        let shown = this.props.toggled ? "flex" : "none"

        let isHorizontal = this.props.data.format < 1.5

        let orientation = {
            width: isHorizontal ? "calc(35vw - 1.5rem)" : "unset",
            height: isHorizontal ? "unset" : "calc(91vh - 2rem)"
        }
        return (
            <div
                className="floatingImages"
                style={{ display: shown }}
                onClick={this.props.toggle}
            >
                <Close
                    className="closeBtn"
                    style={{ fontSize: 45 }}
                    onClick={this.props.toggle}
                />
                <div
                    className="imagesContainer"
                    onClick={this.preventDefault}
                >
                    <div className="textAndImage">
                        <div className="floatingImgText">Original</div>
                        <img src={this.props.data.original} style={orientation} />
                    </div>
                    <div className="textAndImage">
                        <div className="floatingImgText">Modified</div>
                        <img src={this.props.data.modified} style={orientation} />
                    </div>

                </div>
            </div>
        )
    }
}

export default FloatingImages