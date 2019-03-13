import React from "react";
import Helmet from "react-helmet";
import "./GameView.css";
export default function GameView() {
  return (
    <div className="game-view">
      <Helmet>
        <script src="/game/js/phaser.js" />
      </Helmet>

      <div id="game-container" className="game-window" />
      <Helmet>
        <script type="text/javascript" src="/browser/js/browserbundle.js" />
        <script src="/game/js/bundle.js" />
      </Helmet>
    </div>
  );
}
