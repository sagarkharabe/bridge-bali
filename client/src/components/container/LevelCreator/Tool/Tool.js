import React, { Component } from "react";
import "./Tool.css";
export default class Tool extends Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return (
      <React.Fragment>
        <li style={{ height: "32px" }}>
          <a onClick={() => this.props.onClick(this.props.tool)}>
            <img src={this.props.tool.img} alt="" />
          </a>
        </li>
      </React.Fragment>
    );
  }
}
