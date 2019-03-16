import React, { Component } from "react";
import "./App.css";
import GameView from "./components/container/game-view/GameView";
import Home from "./components/container/Home/Home";
import Header from "./components/presentaional/header/Header";
import LevelCreator from "./components/container/LevelCreator/LevelCreator";
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
eventEmitter.only = function(event, callback) {
  this.removeAllListeners(event);
  return this.on(event, callback);
};
eventEmitter.on("loaded", () => {
  console.log("\n\ncreator loaded\n\n");
});
window.eventEmitter = eventEmitter;

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {/* <GameView /> */}
        {/* <Home /> */}
        <LevelCreator />
      </div>
    );
  }
}

export default App;
