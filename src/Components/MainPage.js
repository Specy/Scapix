import React, { Component } from 'react'
import FileContainer from "./FilesContainer"
import "../App.css"
import "../specy.css"
class MainPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isFileHover: false,
			files:["test","test2","test3","test4","test5","test6"]
		}
	}
	removeImage = (e) => {
		let index = this.state.files.indexOf(e)
		if(index < 0) return
		this.state.files.splice(index,1)
		this.setState({
			files: this.state.files
		})
	}
    handleDrop = (e) => {
		let files = []
		for (const file of e.dataTransfer.files) { 
			files.push(file.path)
	    } 
		this.setState({
			files: files
		})
	}
	handleFileHover = (e) => {
		this.setState({
			isFileHover: e === "in" ? true : false
		})
	}
	handleDragHover = (e) => {
		e.stopPropagation();
		e.preventDefault();
	}
	//=======================================================//
	render() {
		return (
            <div className="content dm-L1" style={{perspective:"100px"}}>
				<div 
					className={this.state.isFileHover ? "filePicker formatsHovered" : "filePicker"}
					onDrop={this.handleDrop}
					onDragOver={this.handleDragHover}
					onDragEnter={() => this.handleFileHover("in")} 
					onDragLeave={() => this.handleFileHover("out")}
				>
					<div>
						Drag and drop or click here to select files
					</div>
					<div className="formats">
						.gif .png .jpg
					</div>
				</div>
				<div className="bottomMainPage">
					<div className="sideSettings">
						<div className="column">
							<div>Magnification</div>
								<input type="number" value="1.5" className="input"/>
						</div>
						<div className="column">
							<div>Denoise level</div>
								<select className="input">
									<option>None</option>
									<option selected>Low</option>
									<option>Medium</option>
									<option>High</option>
								</select>
						</div>
					</div>
					<div className="filesHolder">
						{this.state.files.map((file) =>{
							return <FileContainer key={file} action={this.removeImage}>
								{file}
							</FileContainer>
						})}
					</div>
				</div>
            </div>
		)
	}
}

export default MainPage