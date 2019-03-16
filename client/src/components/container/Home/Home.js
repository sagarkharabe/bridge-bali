import React, { Component } from "react";
import GameView from "../game-view/GameView";
import "./Home.css";
export default class Home extends Component {
  tipText = [
    [
      "Use the LEFT and RIGHT arrow keys to walk left and right. ",
      "Gus can't jump, but he can walk into walls in order to rotate the world. ",
      "Black bricks are too slippery to rotate on. ",
      "Collect all the tools in this level to continue. ",
      "Look back at these tips on every tutorial level!"
    ],
    [
      "Press SPACE to place girders. ",
      "You can use girders to build bridges over gaps. ",
      "Gus can walk into girders to rotate the world. ",
      "You can't place girders on black bricks. ",
      "Girders are limited. Check your girder count in the top left. ",
      "You can hold down SPACE while placing girders to keep building a bridge in front of Gus. ",
      "Collect all the tools in this level to continue. "
    ],
    [
      "Cracked blocks will collapse shortly after you step on them. ",
      "You can stand on and rotate onto cracked blocks until they break. ",
      "Collect all the tools in this level to continue. "
    ],
    [
      "Spikes are dangerous. Don't touch them! ",
      "If Gus touches a wall while falling, he'll rotate towards it. Try walking off a ledge and quickly changing direction. ",
      "Hold shift and use the arrow keys to look around. ",
      "Collect all the tools in this level to continue. "
    ],
    [
      "You're almost done with the tutorial! Try solving this puzzle to test your skills. ",
      "If you get stuck, you can press R to restart. ",
      "Remember that you can use SHIFT to look around! ",
      "Collect all the tools in this level to finish the tutorial. "
    ]
  ];

  render() {
    return (
      <section id="home">
        <div id="tutorial" className="row">
          <div className="left-column">
            <h2>Learn to Play</h2>
            <p>
              Help Gus get all his tools back! Follow the tutorial on the right
              to learn how to play. Use the tips here to help you. Good luck!
            </p>

            <h2>Tips & Tricks</h2>
            <ul>
              {this.tipText.map(tip => {
                return <li>{tip}</li>;
              })}
            </ul>

            <h2>Jump Right In</h2>
            <div className="text-center">
              <a className="btn" ng-click="playRandom()">
                Play a Random Level
              </a>
              <br />
              <br />
              <a className="btn" ui-sref="levels.list">
                Browse All Levels
              </a>
            </div>
          </div>
          <GameView />
        </div>

        <div id="featured" className="row">
          <h1 className="text-center">Featured Levels</h1>
          <div className="levels-list">
            <div className="row" ng-repeat="levelRow in featuredLevels">
              {/* <level-thumbnail ng-repeat="level in levelRow" level="level" /> */}
            </div>
          </div>
        </div>

        <div id="whois" className="row">
          <h1 className="text-center">Who is Gus?</h1>
          <p className="text-block pull-left">
            Gus is your down to earth construction worker in a world where
            nothing is down to earth. While working on a construction site, Gus
            was transported to the Chaos Dimension where ordinary physics fly
            out the window. Even worse, Gus's tools were all lost during the
            trip and scattered throughout!
          </p>

          <p className="text-block pull-right text-right">
            Fortunately for Gus, the Chaos Dimension is a lot like just another
            construction site. Thanks to his years of training on dangerous
            sites, and quirks in the gravity of the Chaos Dimension, Gus is a
            master of navigating the perilous unknown. Can Gus find all his
            tools and return home safely, or will be trapped forever?
          </p>
        </div>

        <div id="getgoing" className="row text-center">
          <h1>Get Building!</h1>

          <a className="btn" href="#tutorial">
            Play the Tutorial
          </a>
          <a className="btn" ui-sref="levels.list">
            See All Levels
          </a>
          <a className="btn" ui-sref="builder">
            Build a Level
          </a>
        </div>
      </section>
    );
  }
}
