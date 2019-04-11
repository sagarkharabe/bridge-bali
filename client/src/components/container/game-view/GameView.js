import React, { Component } from "react";
import Helmet from "react-helmet";
import "./GameView.css";
import PropTypes from "prop-types";

export default class GameView extends Component {
  componentDidMount() {
    console.log(this.props);
  }
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
