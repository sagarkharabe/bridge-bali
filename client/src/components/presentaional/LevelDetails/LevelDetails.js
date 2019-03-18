import "./LevelDetails.css";
import GameView from "../../container/game-view/GameView";
import React, { Component } from "react";

export default class LevelDetails extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    const eventEmitter = window.eventEmitter;

    setTimeout(() => eventEmitter.emit("play this level", "Default"), 1500);
  }
  render() {
    return (
      <React.Fragment>
        <div id="level-header">
          <h1>Level Title</h1>
          {/* <div share-square="true" share-links="Facebook" share-title="Article Title" id='fblink'></div> */}

          {/* <reload-warning></reload-warning> */}
        </div>
        <GameView />

        <div id="level-metadata">
          {/* <user-minicard className="pull-right" user="user" creator="creator"></user-minicard> */}
          <div className="metadata">
            <p>
              <span className="label">Total Stars:</span> 5
            </p>
            <p>
              <span className="label">Date Created:</span> 5 march
            </p>
          </div>
          <div
            className="controls"
            id="starring"
            ng-if="user!==null&&user._id!==creator._id"
          >
            <a
              className="btn btn-star-hollow"
              href="#"
              ng-show="!liked && !pending"
              ng-click="starLevel()"
            >
              <span className="glyphicon glyphicon-star-empty" /> STAR
            </a>
            <a className="btn btn-disabled" ng-show="!liked && pending">
              <span className="glyphicon glyphicon-time" /> STAR
            </a>
            <a
              className="btn btn-star"
              href="#"
              ng-show="liked && !pending"
              ng-click="unstarLevel()"
            >
              <span className="glyphicon glyphicon-star" /> STARRED
            </a>
            <a className="btn btn-disabled" ng-show="liked && pending">
              <span className="glyphicon glyphicon-time" /> STARRED
            </a>
          </div>
          <div className="controls" id="fork">
            <a className="btn btn-create" ng-click="edit()">
              Fork Level
            </a>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
