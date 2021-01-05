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
	//=======================================================//
	render() {
        let data = this.props.data
        let color = "rgb(238, 238, 238)"
        if(data.status === "done"){
            if(data.success){
                color = "rgb(200, 239, 200)"
            }else{
                color = "#e3b0b0"
            }
        }else if(data.status === "pending"){
            color = "#f7f1cb"
        }
		return (
            <div className="fileRow text-dark" style={{backgroundColor:color}}>
                <div className="row">
                    <div style={{position:"relative"}}>
                        <img src={data.src} className="previewImage"/>
                            <div className="fileName">
                                {data.name}
                            </div>
                    </div>
                    <div className="dataCol">
                        <div>{data.prettySize}</div>
                        <div>{data.width}x{data.height}</div>
                    </div>
                </div>

                <div className="centerX centerY">
                    <Visibility
                        className="text-dark highlightHover"
                        style={{fontSize:25}}
                        onClick={this.sendImagesData}
                    />
                    <DeleteForever 
                        onClick={() => this.props.action(data.id)}
                        className="text-dark redHover"
                        style={{fontSize:25}}
                    />
                </div>
            </div>
		)
	}
}

export default FileContainer