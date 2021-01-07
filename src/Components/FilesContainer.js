import React, { Component } from 'react'
import "../App.css"
import { DeleteForever, Visibility } from "@material-ui/icons"
class FileContainer extends Component {
	constructor(props) {
		super(props)
    }
    sendImagesData = () =>{
        let data = {
            original:this.props.data.src,
            modified: this.props.data.updatedImg,
            hasImages: true
        }
        this.props.toggleFloatingImages(data)
    }
    handleChange = (e) =>{
        let el = e.target
        this.props.individualChange(el.value,el.name,this.props.data.id)
    }
	//=======================================================//
	render() {
        let data = this.props.data
        let s = this.props.settings
        let color = s.darkMode === "on" ? "rgb(27, 25, 35)" : "rgb(238, 238, 238)"
        let visible = {visibility:"hidden"}
        if(data.status === "done"){
            if(data.success){ 
                color = s.darkMode === "on" ? "rgb(75 153 75)" : "rgb(200, 239, 200)"
                visible.visibility = "visible"
            }else{
                color = s.darkMode === "on" ? "rgb(144 74 74)" : "#e3b0b0"
            }
        }else if(data.status === "pending"){
            color = s.darkMode === "on" ? "#d6c869" : "#f7f1cb"
        }
		return (
            <div 
                className={s.darkMode === "on" ? "fileRow" : "fileRow text-dark"}
                style={{backgroundColor:color}}>
                <div className="row">
                    <div style={{position:"relative"}}>
                        <img src={data.src} className="previewImage"/>
                            <div className="fileName">
                                {data.name}
                            </div>
                    </div>
                    <div className="dataCol">
                        <div>{data.prettySize}</div>
                        <div>
                            {data.width}x{data.height} 
                            {" ➤ "}
                            {Math.floor(data.width * data.scale) }x
                            {Math.floor(data.height * data.scale )}
                        </div>
                    </div>
                </div>

                <div className="flex centerX centerY">
                    <div className="column centerY" style={{marginRight:"0.5rem"}}>
                        <div style={{marginTop:"-1.2rem"}}>Scale</div>
                        <input 
                            type="number"
                            className={"individualInput"} 
                            step={0.1}
                            name="scale"
                            onChange={this.handleChange}
                            value={data.scale}
                        />
                    </div>
                    
                    <Visibility
                        className={s.darkMode === "on" ? "text-white highlightHover" : "text-dark highlightHover"}
                        style={{fontSize:25,...visible}}
                        onClick={this.sendImagesData}
                    />
                    <DeleteForever 
                        onClick={() => this.props.action(data.id)}
                        className={s.darkMode === "on" ? "text-white redHover" : "text-dark redHover"}
                        style={{fontSize:25}}
                    />
                </div>
            </div>
		)
	}
}

export default FileContainer