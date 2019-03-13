import React, { Component } from "react";
import "./LevelCreator.css";
import Tool from "./Tool/Tool";
export default class LevelCreator extends Component {
  state = {
    level_title: "",
    girder_count: 10,
    sky_color: "#4428BC"
  };
  toolArr = {
    Eraser: {
      img: "game/assets/images/eraser.png",
      tile: "Eraser"
    },
    Gus: {
      img: "game/assets/images/gus-static.png",
      tile: "Gus"
    },
    "Red Brick": {
      img: "game/assets/images/brick_red.png",
      tile: "RedBrickBlock"
    },
    "Black Brick": {
      img: "game/assets/images/brick_black.png",
      tile: "BlackBrickBlock"
    },
    "Break Brick": {
      img: "game/assets/images/brick_break.png",
      tile: "BreakBrickBlock"
    },
    Spike: {
      img: "game/assets/images/spike.png",
      tile: "Spike"
    },
    Tool: {
      img: "game/assets/images/tool.png",
      tile: "Tool"
    }
  };
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div>
        <form id="create-level-form" onSubmit={this.onSubmit}>
          <div className="level-title">
            <label htmlFor="level-title" name="level-title-input">
              Level Title
            </label>
            <input
              id="level-title"
              type="text"
              className="level-title-input"
              name="level_title"
              onChange={this.onChange}
            />
          </div>
          <div className="girder-count">
            <label htmlFor="girder-count" name="girder-count">
              Starting Girders
            </label>
            <input
              type="number"
              id="girder-count"
              className="girder-count-input"
              name="girder_count"
              value={this.state.girder_count}
              onChange={this.onChange}
            />
          </div>
          <div className="sky-color">
            <label htmlFor="color" name="sky-color">
              Pick Sky Color
            </label>
            <input
              type="color"
              id="color"
              className="sky-color-input"
              name="sky_color"
              value={this.state.sky_color}
              onChange={this.onChange}
            />
          </div>
        </form>
        <header id="tool-bar-container">
          <nav>
            <ul id="tool-bar">
              {Object.keys(this.toolArr).map(tool => {
                console.log(this.toolArr[tool]);
                return (
                  <Tool
                    key={this.toolArr[tool].tile}
                    tool={this.toolArr[tool]}
                  />
                );
              })}
            </ul>
          </nav>
        </header>
      </div>
    );
  }
}
