import React, { Component } from "react";
import "./Tool.css";
export default class Tool extends Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return (
      <React.Fragment>
        <li>
          <button onClick={() => this.props.onClick(this.props.tool)}>
            <img style={{ height: "32px" }} src={this.props.tool.img} alt="" />
          </button>
        </li>
      </React.Fragment>
    );
  }
}
