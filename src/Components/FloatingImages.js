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
        let data = this.props.data
        let isHorizontal = this.props.data.format < 1.5
        let orientation = {}
        let videoClass = data.isVideo ? "verticalVideo" : ""
        if (isHorizontal) {
            videoClass = data.isVideo ? "horizontalVideo" : ""
        }
        orientation = {
            width: isHorizontal ? "calc(35vw - 1.5rem)" : "unset",
            height: isHorizontal ? "unset" : "calc(91vh - 2rem)"
        }
        let textAndImageClass = "textAndImage " + videoClass
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
                    <div className={textAndImageClass}>
                        <div className="floatingImgText">Original</div>
                        {data.isVideo
                            ? data.video
                            : <img src={data.original} style={orientation} />
                        }
                    </div>
                    <div className={textAndImageClass}>
                        <div className="floatingImgText">Modified</div>
                        {data.isVideo
                            ? <video
                                autoPlay
                                muted={true}
                                loop={true}
                            >
                                <source src={data.modified}>
                                </source>
                            </video>
                            : <img src={data.modified} style={orientation} />
                        }
                    </div>

                </div>
            </div>
        )
    }
}

export default FloatingImages