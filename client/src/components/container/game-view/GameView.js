import React, { Component } from "react";
import Helmet from "react-helmet";
import "./GameView.css";
import PropTypes from "prop-types";

export default class GameView extends Component {
  // constructor(props) {
  //   super(props);
  //   console.log(this.props);
  //   this.state = {
  //     LevelArr: null,
  //     skyColor: null,
  //     girdersAllowed: null
  //   };
  //   this.eventEmitter = window.eventEmitter;
  //   this.eventEmitter.only("what level to play", data => {
  //     console.log("##$$%% what level - ", data);
  //     if (this.state.parsedLevelArr) {
  //       this.eventEmitter.emit("play this level", [
  //         "levelArr",
  //         {
  //           levelArr: this.state.LevelArr,
  //           skyColor: this.state.skyColor,
  //           girdersAllowed: this.state.girdersAllowed
  //         }
  //       ]);
  //       console.log("found a parsed level arr");
  //     } else {
  //       console.log("No parsed level in state ", this.state.parsedLevelArr);
  //       this.eventEmitter.emit("play this level", "log me");
  //     }
  //   });
  // }
  // componentDidMount() {
  //   console.log(this.props);
  // }
  render() {
    return (
      <div className="game-view">
        <Helmet>
          <script src="/game/js/phaser.js" />
        </Helmet>

        <div id="game-container" className="game-window" />
        <Helmet>
          <script src="/game/js/bundle.js" />
        </Helmet>
      </div>
    );
  }
}
GameView.propTypes = {
  levelArr: PropTypes.array.isRequired,
  skyColor: PropTypes.string.isRequired,
  girdersAllowed: PropTypes.number.isRequired
};
