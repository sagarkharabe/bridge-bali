import React, { Component } from "react";
import "./LevelCreator.css";
import Tool from "./Tool/Tool";
import LevelCreatorView from "../LevelCreatorView/LevelCreatorView";
import GameView from "../game-view/GameView";
import { Redirect } from "react-router-dom";
import axios from "axios";
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
      readyToSave: true,
      beaten: false,
      error: false,
      draftSaveObj: null
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
    eventEmitter.only("game ended", async data => {
      console.log("game ended data - ", data);
      console.log("THISTHISWTHISHTIS", this.setState);
      await this.setState(
        {
          beaten: true,
          beatenLevel: parsedLevelArr
        },
        () => {
          console.log(
            "game ended event has been caught by FE and state has been changed"
          );
        }
      );
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
    eventEmitter.only("I need both the maps!", () => {
      console.log(this.state);
      window.eventEmitter.emit("found maps!", [
        "levelArr",
        unparsedLevelArr,
        parsedLevelArr
      ]);
    });
    eventEmitter.once("map for draft save", data => {
      console.log("Recieve data for draft save", data);
      this.submitLevel(
        data,
        this.state.draftSaveObj.levelTitle,
        this.state.draftSaveObj.girdersAllowed,
        this.state.draftSaveObj.skyColor,
        this.state.draftSaveObj.shouldPublish,
        this.state.draftSaveObj.levelId
      )
        .then(async data => {
          console.log("recieved data after saving draft", data);
          await this.setState({
            error: false,
            success: true,
            readyToSave: true
          });
        })
        .catch(async err => {
          console.error(err);
          await this.setState({
            error: true,
            success: false,
            readyToSave: true
          });
        });
    });
    eventEmitter.only("need sky color", () => {
      console.log("Got a event req for 'need skycolor' , sending it ");
      eventEmitter.emit("here's sky color", skyColor);
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
    eventEmitter.once("I need both the maps!", () => {
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
    eventEmitter.once("map for draft save", data => {
      console.log("Recieve data for draft save", data);
      this.submitLevel(
        data,
        this.state.draftSaveObj.levelTitle,
        this.state.draftSaveObj.girdersAllowed,
        this.state.draftSaveObj.skyColor,
        this.state.draftSaveObj.shouldPublish,
        this.state.draftSaveObj.levelId
      )
        .then(async data => {
          console.log("recieved data after saving draft", data);
          await this.setState({
            error: false,
            success: true,
            readyToSave: true
          });
        })
        .catch(async err => {
          console.error(err);
          await this.setState({
            error: true,
            success: false,
            readyToSave: true
          });
        });
    });
  }

  submitLevel = (objArr, title, girderCount, skyColor, isPublished, id) => {
    console.log("id", id, "is published", isPublished);
    try {
      var map = {
        startGirders: girderCount,
        objects: objArr,
        skyColor: skyColor
      };
      var level = {
        title: title,
        map: map,
        published: isPublished || false
      };
      level = JSON.parse(JSON.stringify(level));
      if (!id || isPublished)
        return axios
          .post("http://localhost:5000/api/levels", level)
          .then(res => res.data);
      else return axios.put("/api/levels/" + id, level).then(res => res.data);
    } catch (e) {
      console.error(e);
    }
  };

  submitBeatenLevel = async (
    levelArrayBeaten,
    levelTitle,
    girdersAllowed,
    skyColor,
    shouldPublish
  ) => {
    await this.setState({
      readyToSave: false
    });
    //shouldPublish indicates if the level is being saved permenantly or simply for future editing
    if (typeof shouldPublish !== "boolean") shouldPublish = true;
    shouldPublish = shouldPublish || false;
    if (!levelArrayBeaten && !shouldPublish) {
      levelArrayBeaten = this.state.parsedLevelArr;
    }
    if (!levelArrayBeaten || !levelTitle) {
      console.log("something is missing");
      console.log(levelArrayBeaten);
      console.log(levelTitle);
      await this.setState({ readyToSave: true, error: true });
      return;
    }
    if (!girdersAllowed) girdersAllowed = 0;
    if (!skyColor) skyColor = "#000000";
    if (this.state.testing) {
      console.log("Submit while user has tested.");

      this.submitLevel(
        levelArrayBeaten,
        levelTitle,
        girdersAllowed,
        skyColor,
        shouldPublish,
        this.state.levelId
      )
        .then(async data => {
          console.log(data);
          await this.setState({
            error: false,
            success: true,
            readyToSave: true
          });
          // if(shouldPublish){
          //   <Redirect to={{
          //     pathname: '/'
          //   }}></Redirect>
          // }
        })
        .catch(async err => {
          console.error(err);
          await this.setState({
            error: true,
            success: false,
            readyToSave: true
          });
        });
    } else {
      console.log(
        "Submit while user has edited, going to take level creator result after parsing the unparsed"
      );
      await this.setState({
        draftSaveObj: {
          levelTitle: levelTitle,
          girdersAllowed: girdersAllowed,
          skyColor: skyColor,
          shouldPublish: shouldPublish,
          levelId: this.state.levelId
        },
        nextMapUse: "saveGameProgress"
      });

      this.eventEmitter.emit("request tile map for draft save", "");
    }
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
        <br />
        {this.state.error ? (
          <div>
            <p className="text-danger">
              Error: There was a problem submitting your level, please ensure
              all required information is provided.
            </p>
          </div>
        ) : null}
        <br />
        {this.state.success ? (
          <div>
            <p class="text-success">Level was successfully saved!</p>
          </div>
        ) : null}
        <br />

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
              onClick={() =>
                this.submitBeatenLevel(
                  this.state.parsedLevelArr,
                  this.state.levelTitle,
                  this.state.girdersAllowed,
                  this.state.skyColor,
                  false
                )
              }
            >
              Save Draft
            </button>
          ) : null}
          {this.state.readyToSave && this.state.beaten ? (
            <button
              className="btn btn-create"
              onClick={() =>
                this.submitBeatenLevel(
                  this.state.parsedLevelArr,
                  this.state.levelTitle,
                  this.state.girdersAllowed,
                  this.state.skyColor
                )
              }
            >
              Publish Level
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  onChange = e => {
    e.persist();
    if (e.target.name === "skyColor") {
      this.setState({ [e.target.name]: e.target.value }, () =>
        console.log("skyColor change to ", e.target.value, this.state.skyColor)
      );
      console.log("Sending sky color to the game module");
      this.eventEmitter.emit("here's sky color", this.state.skyColor);
    } else
      this.setState({ [e.target.name]: e.target.value }, () =>
        console.log("State changed ", this.state)
      );
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
      tile: null
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
