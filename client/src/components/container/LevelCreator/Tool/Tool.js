import React, { Component } from "react";
import "./Tool.css";
export default class Tool extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.tool.tile);
  }
  render() {
    return (
      <React.Fragment>
        <li>
          <a href="/" style={{ height: "32px", display: "inline-block" }}>
            <img src={this.props.tool.img} alt="" />
          </a>
        </li>
      </React.Fragment>
    );
  }
}
