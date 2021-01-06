import React, {Component, useCallback} from 'react'
import FileContainer from "./FilesContainer"
import {useDropzone} from 'react-dropzone'
import prettyBytes from "pretty-bytes"
import ImagesSettings from "./ImagesSettings"
import "../App.css"
import "../specy.css"
function DropZone(callBack) {
	const onDrop = useCallback(acceptedFiles => {
		callBack.drop(acceptedFiles)
	}, [])
	const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
	return (
	  <div {...getRootProps()} className={isDragActive ? "filePicker formatsHovered" : "filePicker"}>
		<input {...getInputProps()} />
		{
		  isDragActive ?
			<p>Drop files here...</p> :
			<p>Drop files here or click to select.</p>
		}
		<div className="formats">
			.gif .png .jpg
		</div>
	  </div>
	)
  }
class MainPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isFileHover: false,
			files:{},
			globalImgSettings:{
				magnification: 2,
				denoiseLevel: "None",
				outputFormat: "Original"
			}
		}
		window.ipcRenderer.on('done-execution', (event, arg) => {
			let file = this.state.files[arg.id]
			file.status = arg.status
			file.success = arg.success
			file.updatedImg = arg.upscaledImg
			console.log("Done")
			this.setState({
				files: this.state.files
			})
		})
		window.ipcRenderer.on('update-execution', (event, arg) => {
			console.log("Update")
			let file = this.state.files[arg.id]
			file.status = arg.status
			this.setState({
				files: this.state.files
			})
		})
	}
	removeImage = (e) => {
		delete this.state.files[e]
		this.setState({
			files: this.state.files
		})
	}
	executeWaifu = () =>{
		let dataToSend = Object.keys(this.state.files).map((el)=>{
			el = this.state.files[el]
			return {
				name:el.name,
				path:el.path,
				width: el.width,
				height: el.height,
				noise: el.noise,
				scale: el.scale,
				format: el.format,
				id: el.id,
				size: el.size,
			}
		})
		window.ipcRenderer.send('execute-waifu',dataToSend)
	}

	handleImgSettingsChange = (value,type) =>{
		let toChange = this.state.globalImgSettings[type]
		toChange = isNaN(value) ? value : parseFloat(value)
		if(value < 0.6 && type==="magnification" && value !== ""){
			toChange = 0.6
		}
		let newState = this.state.globalImgSettings
		newState[type] = toChange
		Object.keys(this.state.files).map(img =>{
			img = this.state.files[img]
			img.noise = newState.denoiseLevel
			img.scale = newState.magnification
			img.format = newState.outputFormat
			return img
		})
		this.setState({
			globalImgSettings: newState,
			files: this.state.files
		})
	}
	getRandomId = () => {
		let str1 = Math.random().toString(36).substring(7)
		let str2 = Math.random().toString(36).substring(7)
		return str1 + str2
	}
    handleDrop = (e) => {
		let files = this.state.files
		for (const file of e) { 
			let obj = {
				name:file.name,
				path:file.path,
				src: null,
				width: 0,
				height: 0,
				scale: this.state.globalImgSettings.magnification,
				status: "idle",
				updatedImg: null,
				format:this.state.globalImgSettings.outputFormat,
				noise: this.state.globalImgSettings.denoiseLevel,
				id: this.getRandomId(),
				size: file.size,
				prettySize: prettyBytes(file.size)
			}
			let exists = Object.keys(files).findIndex(e =>{
				return files[e].path === obj.path
			})
			if(exists < 0){
				files[obj.id] = obj
				const reader = new FileReader();
				reader.onload = (data) => {
					var image = new Image();
					image.src = data.target.result
					image.onload = () => {
						obj.src = data.target.result
						obj.width = image.width
						obj.height = image.height
						this.setState({
							files: files
						})
					}

				}
				reader.readAsDataURL(file);
			}
		}
	}
	//=======================================================//
	render() {
		return (
            <div className="content l1" style={{perspective:"100px"}}>
				<div className="upperMainPage box-shadow">
					<DropZone drop={this.handleDrop} />
				</div>
				<div className="bottomMainPage">
					<ImagesSettings 
						data={this.state.globalImgSettings} 
						action={this.handleImgSettingsChange}
						executeWaifu={this.executeWaifu}
					/>
					<div className="filesHolder l1 box-shadow">
						<div className="overflowFileHolder scroll">
							{Object.keys(this.state.files).map((key) =>{
								let file = this.state.files[key]
								return <FileContainer 
											key={file.id} 
											action={this.removeImage} 
											data={file}
											toggleFloatingImages={this.props.toggleFloatingImages}
										/>
							})}
						</div>
					</div>
				</div>
            </div>
		)
	}
}

export default MainPage