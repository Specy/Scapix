import React, { Component } from 'react'
import "../App.css"
import { DeleteForever, Visibility } from "@material-ui/icons"
class FileContainer extends Component {
	constructor(props) {
		super(props)
    }
    
	//=======================================================//
	render() {
        let data = this.props.data
		return (
            <div className="fileRow wm-L2 text-dark">
                <div style={{position:"relative"}}>
                    <img src={`data:image/jpeg;base64,${data.data}`} className="previewImage"/>
                        <div className="fileName">
                            {data.name}
                        </div>
                </div>
                <div className="centerX centerY">
                    <Visibility
                        className="text-dark highlightHover"
                        style={{fontSize:25}}
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