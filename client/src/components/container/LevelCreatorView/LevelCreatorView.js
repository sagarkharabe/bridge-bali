import React from "react";
import "./LevelCreatorView.css";
import Helmet from "react-helmet";
export default function LevelCreatorView(props) {
  return (
    <div className="level-creator-view">
      <Helmet>
        <script src="/game/js/phaser.js" />
      </Helmet>
      <div
        className="game-window"
        id="level-creator-container"
        style={{
          cursor: 'url("' + props.activeToolImg + '") 16 16, auto'
        }}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
      <Helmet>
        {/* <script
          type="text/javascript"
          src="/browser/js/states/createLevel.js"
        /> */}
        <script
          type="text/javascript"
          src="/levelCreator/levelCreatorBundle.js"
        />
      </Helmet>
    </div>
  );
}
