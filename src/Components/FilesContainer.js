import React, { Component } from 'react'
import "../App.css"
import { DeleteForever, Visibility, Info } from "@material-ui/icons"
class FileContainer extends Component {
    constructor(props) {
        super(props)
        this.videoHref = React.createRef();
    }
    sendImagesData = () => {
        let propsData = this.props.data
        let data = {
            original: propsData.src,
            modified: propsData.updatedImg,
            format: propsData.height / propsData.width,
            hasImages: true,
            isVideo: false
        }

        if(propsData.isVideo){
            data.video = propsData.video
            data.isVideo = true
        }
        this.props.toggleFloatingImages(data)
    }
    handleChange = (e) => {
        let el = e.target
        this.props.individualChange(el.value, el.name, this.props.data.id)
    }
    getEven = (num) => 2 * Math.round(num / 2); 

	loadedMetadata = (e) => {
        this.props.handleMetadata({
            event: e,
            id: this.props.data.id
        })
    } 
    showInfo = (e) => {
        window.showMessage(this.props.data.message, 1, 10000, () => {
            console.log("clicked")
        })
    }
    //=======================================================//
    render() {
        let data = this.props.data
        let s = this.props.settings
        let color = s.darkMode === "on" ? "rgb(27, 25, 35)" : "rgb(238, 238, 238)"
        let visible = { visibility: "hidden" }
        let visible2 = { visibility: "hidden" }
        let visible3 = { visibility: "visible" }
        if (!this.props.canRun) visible3.visibility = "hidden"
        if (data.status === "done") {
            visible2.visibility = "visible"
            if (data.success) {
                color = s.darkMode === "on" ? "rgb(75 153 75)" : "rgb(200, 239, 200)"
                visible.visibility = "visible"
            } else {
                color = s.darkMode === "on" ? "rgb(144 74 74)" : "#e3b0b0"
            }
        } else if (data.status === "pending" || data.status === "processing") {
            color = s.darkMode === "on" ? "#d6c869" : "#f7f1cb"
        }
        let progressBar = data.frames[0] / data.frames[1] * 95 + "%"
        if (data.status === "done") progressBar = "100%"
        let frameTime = data.length * (data.frames[0] / data.frames[1])
        if(data.frames[0] !== 0){
            this.videoHref.current.currentTime = frameTime
            this.videoHref.current.pause()
        }
        return (
            <div
                className={s.darkMode === "on" ? "fileRow" : "fileRow text-dark"}
                style={{ backgroundColor: color }}>
                <div className="row">
                    <div style={{ position: "relative" }}>
                        {data.isVideo ? 
                            <video
                                className="previewImage" 
                                autoPlay
                                muted={true}
                                ref={this.videoHref}
                                loop={true}
                                onLoadedMetadata={this.loadedMetadata}
                            >
                              <source 
                                src={data.video}
                                
                            >
                              </source>
                          </video>
                        : <img src={data.src} className="previewImage" />
                        }
                        <div className="fileName">
                            {data.name}
                        </div>
                    </div>
                    <div className="dataCol">
                        <div>{data.prettySize}</div>
                        <div>
                            {data.width}x{data.height}
                            {" ➤ "}
                            {Math.floor(data.width * data.scale)}x
                            {Math.floor(data.height * data.scale)}
                        </div>
                    </div>
                </div>
                <div
                    className="progressWrapper"
                    style={{ visibility: data.frames[1] === 0 || data.status === "done" ? "hidden" : "visible" }}
                >
                    <div>
                        {data.frames[0] === data.frames[1]
                            ? "Encoding..."
                            : "Upscaling frame: " + data.frames[0] + "/" + data.frames[1]
                        }
                    </div>
                    <div className="progressOuter">
                        <div
                            className="progressInner"
                            style={{ width: progressBar }}
                        >
                        </div>
                    </div>
                </div>
                <div className="flex centerX centerY">
                    {data.name.includes(".gif") ?
                        <div className="column centerY" style={{ marginRight: "0.5rem" }}>
                            <div style={{ marginTop: "-1.2rem" }}>Speed</div>
                            <input
                                type="number"
                                className={"individualInput"}
                                step="0.1"
                                name="speed"
                                onChange={this.handleChange}
                                value={data.speed}
                            />
                        </div>
                        : ""
                    }
                    <div className="column centerY" style={{ marginRight: "0.5rem" }}>
                        <div style={{ marginTop: "-1.2rem" }}>Scale</div>
                        <input
                            type="number"
                            className={"individualInput"}
                            step="0.05"
                            name="scale"
                            onChange={this.handleChange}
                            value={data.scale}
                        />
                    </div>
                    <Info
                        className={s.darkMode === "on" ? "text-white highlightHover" : "text-dark highlightHover"}
                        style={{ fontSize: 25, ...visible2 }}
                        onClick={this.showInfo}
                    />
                    <Visibility
                        className={s.darkMode === "on" ? "text-white highlightHover" : "text-dark highlightHover"}
                        style={{ fontSize: 25, ...visible }}
                        onClick={this.sendImagesData}
                    />
                    <DeleteForever
                        onClick={() => {
                            this.props.action(data.id)
                        }}

                        className={s.darkMode === "on" ? "text-white redHover" : "text-dark redHover"}
                        style={{ fontSize: 25, ...visible3 }}
                    />
                </div>
            </div>
        )
    }
}

export default FileContainer