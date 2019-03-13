import React, { Component } from "react";
import "./App.css";
import GameView from "./components/container/game-view/GameView";
import Header from "./components/presentaional/header/Header";
import LevelCreator from "./components/container/LevelCreator/LevelCreator";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        {/* <GameView /> */}
        <LevelCreator />
      </div>
    );
  }
}

export default App;
