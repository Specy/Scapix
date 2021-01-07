import React, {Component, useCallback} from 'react'
import FileContainer from "./FilesContainer"
import {useDropzone} from 'react-dropzone'
import prettyBytes from "pretty-bytes"
import ImagesSettings from "./ImagesSettings"
import "../App.css"
import "../specy.css"
function DropZone(props) {
	const onDrop = useCallback(acceptedFiles => {
		props.drop(acceptedFiles)
	}, [])
	const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
	let classes = isDragActive ? "filePicker formatsHovered" : "filePicker"
	classes += props.settings.darkMode === "on" ? " filePickerWhite" : ""
	return (
	  <div {...getRootProps()} className={classes}>
		<input {...getInputProps()} />
		{
		  isDragActive ?
			<p>Drop files here...</p> :
			<p>Drop files here or click to select.</p>
		}
		<div className="formats">
			.webp .png .jpg
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
				scale: 2,
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
	handleIndividualSettingsChange = (value,type,id) => {
		if(value < 0.6 && type==="scale" && value !== ""){
			value = 0.6
		}
		let oldState = this.state.files[id]
		console.log(oldState[type])
		oldState[type] = value
		this.setState({
			files: this.state.files
		})
	}
	handleImgSettingsChange = (value,type) =>{
		let toChange = this.state.globalImgSettings[type]
		toChange = isNaN(value) ? value : parseFloat(value)
		if(value < 0.6 && type==="scale" && value !== ""){
			toChange = 0.6
		}
		let newState = this.state.globalImgSettings
		newState[type] = toChange
		Object.keys(this.state.files).map(img =>{
			img = this.state.files[img]
			img.noise = newState.denoiseLevel
			img.scale = newState.scale
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
				scale: this.state.globalImgSettings.scale,
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
	openFolder = () => {
		window.ipcRenderer.send("open-folder")
	}
	//=======================================================//
	render() {
		let s = this.props.settings
		return (
			<div 
				className={s.darkMode === "on" ? "content dm-L1" : "content l1"} 
				style={{perspective:"100px"}}>
				<div 
					className={s.darkMode === "on" ? "upperMainPage dm-L2" : "upperMainPage box-shadow"}
				>
					<button 
						className="button outputFolder"
						onClick={this.openFolder}
					>Open output folder</button>
					<DropZone drop={this.handleDrop} settings={s}/>
				</div>
				<div className="bottomMainPage">
					<ImagesSettings 
						settings={s}
						data={this.state.globalImgSettings} 
						action={this.handleImgSettingsChange}
						executeWaifu={this.executeWaifu}
					/>
					<div className={s.darkMode === "on" ? "filesHolder dm-L2" : "filesHolder l1 box-shadow"}>
						<div className="overflowFileHolder scroll">
							{Object.keys(this.state.files).map((key) =>{
								let file = this.state.files[key]
								return <FileContainer 
								settings={s}
											key={file.id} 
											action={this.removeImage}
											individualChange={this.handleIndividualSettingsChange}
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