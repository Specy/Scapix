import React, { Component } from 'react'
import "../specy.css"
import "../App.css"
class FloatingMessage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            animate: false
        }
    }
    handleClick = () => {
        let func = this.props.data.action
        if (typeof func === "function") {
            func()
        }
    }
    //=======================================================//
    render() {
        let data = this.props.data
        let animation = data.isShown ? "floatingMessage" : "floatingMessage hiddenRight"
        return (
            <div
                onClick={this.handleClick}
                className={animation}
            >
                {data.message}
            </div>
        )
    }
}

export default FloatingMessage