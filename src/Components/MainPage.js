import React, {Component, useCallback} from 'react'
import FileContainer from "./FilesContainer"
import {useDropzone} from 'react-dropzone'
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
			files:{}
		}
		window.ipcRenderer.on('receive-images', (event, arg) => {
			let files = this.state.files
			arg.forEach(file =>{
				files[file.id].data = file.data
			})
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
	getRandomId = () => {
		let str1 = Math.random().toString(36).substring(7)
		let str2 = Math.random().toString(36).substring(7)
		return str1 + str2
	}
    handleDrop = (e) => {
		let files = this.state.files
		let newFiles = {}
		for (const file of e) { 
			let obj = {
				name:file.name,
				path:file.path,
				data: "",
				id: this.getRandomId()
			}
			let exists = Object.keys(files).findIndex(e =>{
				return files[e].path === obj.path
			})
			if(exists < 0){
				newFiles[obj.id] = obj
				files[obj.id] = obj
			}
		}
		this.setState({
			files: files
		},() => {
			let dataToSend = Object.keys(newFiles).map(key => files[key])
			window.ipcRenderer.send('send-images',dataToSend)
		})
	}
	//=======================================================//
	render() {
		return (
            <div className="content l1" style={{perspective:"100px"}}>
				<div className="upperMainPage box-shadow">
					<DropZone drop={this.handleDrop}/>
				</div>
				<div className="bottomMainPage">
					<div className="sideSettings l1 box-shadow">
						<div className="innerSideSettings">
							<div className="column">
								<div>Magnification</div>
									<input type="number" value="1.5" className="input wm-L2"/>
							</div>
							<div className="column">
								<div>Denoise level</div>
									<select className="input wm-L2" value="Low">
										<option>None</option>
										<option>Low</option>
										<option>Medium</option>
										<option>High</option>
									</select>
							</div>
						</div>

					</div>
					<div className="filesHolder l1 box-shadow">
						<div className="overflowFileHolder scroll">
							{Object.keys(this.state.files).map((key) =>{
								let file = this.state.files[key]
								return <FileContainer key={file.id} action={this.removeImage} data={file}/>
							})}
						</div>
					</div>
				</div>
            </div>
		)
	}
}

export default MainPage