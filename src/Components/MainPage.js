import React, { Component, useCallback } from 'react'
import FileContainer from "./FilesContainer"
import { useDropzone } from 'react-dropzone'
import prettyBytes from "pretty-bytes"
import ImagesSettings from "./ImagesSettings"
import "../App.css"
import "../specy.css"
const isVideo = require('is-video')
function DropZone(props) {
	const onDrop = useCallback(acceptedFiles => {
		props.drop(acceptedFiles)
	}, [])
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
	let classes = isDragActive ? "filePicker formatsHovered" : "filePicker"
	classes += props.settings.darkMode === "on" ? " filePickerWhite" : ""
	return (
		<div {...getRootProps()} className={classes}>
			<input {...getInputProps()} />
			{
				isDragActive ?
					<p>Drop files here...</p> :
					<p>Drop files here or click to select</p>
			}
			<div className="formats">
				.mp4 .gif .webp .png .jpg
		</div>
		</div>
	)
}
class MainPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isFileHover: false,
			files: {},
			globalImgSettings: {
				scale: 2,
				denoiseLevel: "None",
				outputFormat: "Original",
				model: "Drawing"
			}
		}
		window.ipcRenderer.on('done-execution', (event, arg) => {
			try {
				let file = this.state.files[arg.id]
				file.message = arg.message
				file.status = arg.status
				file.success = arg.success
				file.updatedImg = arg.upscaledImg
				console.log("Done", arg.id)
				this.setState({
					files: this.state.files
				})
			} catch (e) {
				window.showMessage("Error, Stop the execution and reload", 1)
				console.log(e)
			}

		})
		window.ipcRenderer.on('update-execution', (event, arg) => {
			try {

				let file = this.state.files[arg.id]
				file.status = arg.status
				if (Array.isArray(arg.frames)) file.frames = arg.frames
				console.log("Update", arg.id)
				this.setState({
					files: this.state.files
				})
			} catch (e) {
				window.showMessage("Error, Stop the execution and reload", 1)
				console.log(e)
			}

		})
	}

	removeImage = (e) => {
		delete this.state.files[e]
		this.setState({
			files: this.state.files
		})
	}
	executeWaifu = () => {
		console.log("Executing")
		let files = Object.keys(this.state.files).map((el) => {
			el = this.state.files[el]
			return {
				name: el.name,
				path: el.path,
				width: this.getEven(el.width),
				height: this.getEven(el.height),
				noise: el.noise,
				scale: el.scale,
				speed: el.speed,
				model: el.model,
				isVideo: el.isVideo,
				frames: [0, 0],
				endPath: this.props.settings.outputPath,
				format: el.format,
				id: el.id,
				size: el.size,
			}
		})
		let dataToSend = {
			maxUpscales: this.props.settings.maxUpscales,
			files: files,
			parallelFrames: this.props.settings.parallelFrames
		}
		 Object.keys(this.state.files).map(img => {
			img = this.state.files[img]
			img.status = "idle"
			return img
		})
		this.setState({
			files: this.state.files
		},() => {window.ipcRenderer.send('execute-waifu', dataToSend)})	
	}
	cancelExecution = () => {
		window.ipcRenderer.send("cancel-execution")
		Object.keys(this.state.files).map(img => {
			img = this.state.files[img]
			img.status = "idle"
			img.frames = [0, 0]
			return img
		})
		this.setState({
			files: this.state.files
		})

	}
	handleIndividualSettingsChange = (value, type, id) => {
		let toChange = isNaN(value) ? value : parseFloat(value)
		if (value < 0.6 && type === "scale") {
			toChange = 0.6
		}
		if(value === "") toChange = 2
		let oldState = this.state.files[id]
		oldState[type] = toChange
		this.setState({
			files: this.state.files
		})
	}

	handleImgSettingsChange = (value, type) => {

		let toChange = isNaN(value) ? value : parseFloat(value)
		if (value < 0.6 && type === "scale") {
			toChange = 0.6
		}
		if(value === "") toChange = 2
		let newState = this.state.globalImgSettings
		newState[type] = toChange
		Object.keys(this.state.files).map(img => {
			img = this.state.files[img]
			img.noise = newState.denoiseLevel
			img.scale = newState.scale
			img.format = newState.outputFormat
			img.model = newState.model
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
	getEven = (num) => 2 * Math.round(num / 2); 
	handleMetadata = (data) => {
		let obj = this.state.files[data.id]
		obj.width = data.event.currentTarget.videoWidth
		obj.height = data.event.currentTarget.videoHeight
		this.setState({
			files: this.state.files
		})
	}
	handleDrop = (e) => {
		let files = this.state.files
		for (const file of e) {
			let obj = {
				name: file.name,
				path: file.path,
				src: null,
				video: <video />,
				width: 0,
				height: 0,
				speed: 1,
				endPath: "default",
				scale: this.state.globalImgSettings.scale,
				status: "idle",
				model: "Drawing",
				updatedImg: null,
				frames: [0, 0],
				parallelFrames: 1,
				isVideo: isVideo(file.path),
				format: this.state.globalImgSettings.outputFormat,
				noise: this.state.globalImgSettings.denoiseLevel,
				id: this.getRandomId(),
				size: file.size,
				prettySize: prettyBytes(file.size)
			}
			let exists = Object.keys(files).findIndex(e => {
				return files[e].path === obj.path
			})
			if (exists < 0) {
				files[obj.id] = obj
				const reader = new FileReader();
				reader.onload = (data) => {
					if (obj.isVideo) {
						let callback = (e) => {
							obj.width = e.currentTarget.videoWidth
							obj.height = e.currentTarget.videoHeight
							
							this.setState({
								files: files
							})
						}
						obj.video = data.target.result
						let vid = <video className="previewImage" 
							autoPlay 
							muted={true} 
							loop={true} 
							onLoadedMetadata={callback}
						>
							<source src={data.target.result}>
							</source>
						</video>
						this.setState({
							files: files
						})
					} else {
						let image = new Image();
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

				}
				reader.readAsDataURL(file);
			}
		}
	}

	//=======================================================//
	render() {
		let s = this.props.settings
		let canRun = Object.keys(this.state.files).every(key => {
			let file = this.state.files[key]
			return file.status === "done" || file.status === "idle"
		})
		if (Object.keys(this.state.files).length === 0) canRun = false
		return (
			<div
				className={s.darkMode === "on" ? "content dm-L1" : "content l1"}
				style={{ perspective: "100px" }}
			>
				<div
					className={s.darkMode === "on" ? "upperMainPage dm-L2" : "upperMainPage box-shadow"}
				>
					<DropZone drop={this.handleDrop} settings={s} />
				</div>
				<div className="bottomMainPage">
					<ImagesSettings
						settings={s}
						isEmpty={Object.keys(this.state.files).length === 0}
						canRun={canRun}
						data={this.state.globalImgSettings}
						action={this.handleImgSettingsChange}
						executeWaifu={this.executeWaifu}
						cancelExecution={this.cancelExecution}
					/>
					<div className={s.darkMode === "on" ? "filesHolder dm-L2" : "filesHolder l1 box-shadow"}>
						<div className="overflowFileHolder scroll">
							{Object.keys(this.state.files).map((key) => {
								let file = this.state.files[key]
								return <FileContainer
									settings={s}
									key={file.id}
									canRun={canRun}
									handleMetadata={this.handleMetadata}
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