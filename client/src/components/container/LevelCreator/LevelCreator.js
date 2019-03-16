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
      levelTitle: "",
      girdersAllowed: 10,
      skyColor: "#4428BC",
      activeToolImg: "game/assets/images/brick_red.png",
      testing: false,
      sentId: false,
      levelId: null,
      nextMapUse: null,
      unparsedLevelArr: null,
      parsedLevelArr: [],
      readyToSave: false
    };
    this.eventEmitter = window.eventEmitter;
  }
  componentDidUpdate() {
    const eventEmitter = window.eventEmitter;
    var { unparsedLevelArr, parsedLevelArr } = this.state;
    eventEmitter.only("send tile map", async mapArr => {
      if (this.state.nextMapUse === "log") {
        console.log("recieved.");
        console.dir(mapArr);
      } else if (this.state.nextMapUse === "switchToGame") {
        console.log("ready to switch");

        await this.setState({
          parsedLevelArr: mapArr[0],
          unparsedLevelArr: mapArr[1],
          testing: !this.state.testing
        });
      }
    });
  }
  componentWillUpdate() {
    const eventEmitter = window.eventEmitter;
    var {
      unparsedLevelArr,
      parsedLevelArr,
      skyColor,
      girdersAllowed,
      nextMapUse,
      testing
    } = this.state;
    eventEmitter.only("I need both the maps!", function() {
      console.log(this.state);
      window.eventEmitter.emit("found maps!", [
        "levelArr",
        unparsedLevelArr,
        parsedLevelArr
      ]);
    });
  }
  componentDidMount() {
    const eventEmitter = window.eventEmitter;
    var {
      unparsedLevelArr,
      parsedLevelArr,
      skyColor,
      girdersAllowed,
      nextMapUse,
      testing
    } = this.state;
    eventEmitter.once("I need both the maps!", function() {
      console.log(this.state);
      window.eventEmitter.emit("found maps!", [
        "levelArr",
        unparsedLevelArr,
        parsedLevelArr
      ]);
    });
    eventEmitter.only("what level to play", data => {
      console.log("##$$%% what level - ", data);
      if (this.state.parsedLevelArr) {
        window.eventEmitter.emit("play this level", [
          "levelArr",
          {
            levelArr: this.state.parsedLevelArr,
            skyColor: this.state.skyColor,
            girdersAllowed: this.state.girdersAllowed
          }
        ]);
        console.log("found a parsed level arr");
      } else {
        console.log(this.state.parsedLevelArr);
      }
    });
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  requestParsedTileMap = () => {
    this.setState({
      nextMapUse: "log"
    });
    console.log("requesting tile map...");
    console.log("nextmapuse", this.state.nextMapUse);
    this.eventEmitter.emit("request tile map", "");
  };
  testTesting = async () => {
    await this.setState(
      {
        activeToolImg: this.toolArr["Red Brick"].img,
        nextMapUse: "switchToGame"
      },
      () => {
        console.log("state update in testing func", this.state);
      }
    );

    if (!this.state.testing) {
      this.eventEmitter.emit("request tile map", "");
    } else {
      await this.setState({
        testing: !this.state.testing,
        beatenLevel: null,
        beaten: false
      });
    }

    window.game.destroy();

    (function checkGameDestroyed() {
      if (window.game.isBooted === false) {
        window.game = null;
      } else {
        setTimeout(checkGameDestroyed, 100);
      }
    })();
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
              name="levelTitle"
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
              name="girdersAllowed"
              value={this.state.girdersAllowed}
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
              name="skyColor"
              value={this.state.skyColor}
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

        <div id="editor-controls">
          {!this.state.testing ? (
            <button className="btn" onClick={this.testTesting}>
              Test Level
            </button>
          ) : (
            <button className="btn" onClick={this.testTesting}>
              Edit Level
            </button>
          )}

          {this.state.readyToSave ? (
            <button
              className="btn btn-create"
              ng-click="submitBeatenLevel(beatenLevel, levelTitle, girdersAllowed, skyColor, false)"
            >
              Save Draft
            </button>
          ) : null}
          {this.state.readyToSave ? (
            <button
              className="btn btn-create"
              onClick="submitBeatenLevel(beatenLevel, levelTitle, girdersAllowed, skyColor)"
            >
              Submit Level
            </button>
          ) : null}
        </div>
      </div>
    );
  }
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
}
