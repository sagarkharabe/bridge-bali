import React, { Component } from "react";
import "./LevelCreator.css";
import Tool from "./Tool/Tool";
import LevelCreatorView from "../LevelCreatorView/LevelCreatorView";
import GameView from "../game-view/GameView";
export default class LevelCreator extends Component {
  constructor() {
    super();
    this.eventEmitter = window.eventEmitter;
    this.state = {
      level_title: "",
      girder_count: 10,
      sky_color: "#4428BC",
      activeToolImg: "game/assets/images/brick_red.png",
      testing: false,
      sentId: false,
      levelId: null,
      nextMapUse: null,
      unparsedLevelArr: null,
      parsedLevelArr: []
    };
  }

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

  toolChange = tool => {
    this.setState({
      activeToolImg: tool.img
    });
    console.log("##from change tools", tool);
    this.eventEmitter.emit("change active tool", tool.tile);
  };
  stopInputCapture = () => {
    this.eventEmitter.emit("stop input capture");
  };

  startInputCapture = () => {
    this.eventEmitter.emit("start input capture");
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
                return (
                  <Tool
                    onClick={tool => this.toolChange(tool)}
                    key={this.toolArr[tool].tile}
                    tool={this.toolArr[tool]}
                  />
                );
              })}
            </ul>
          </nav>
        </header>
        {this.state.testing ? (
          <GameView />
        ) : (
          <LevelCreatorView
            onMouseEnter={this.startInputCapture}
            onMouseLeave={this.stopInputCapture}
            activeToolImg={this.state.activeToolImg}
          />
        )}
      </div>
    );
  }
}
