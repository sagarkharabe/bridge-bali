import React, { Component } from "react";
import "./App.css";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { fetchUser } from "./actions/authAction";
import GameView from "./components/container/game-view/GameView";
import Home from "./components/container/Home/Home";
import Header from "./components/presentaional/header/Header";
import LevelCreator from "./components/container/LevelCreator/LevelCreator";
import LevelDetails from "./components/presentaional/LevelDetails/LevelDetails";

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
  componentDidMount() {
    this.props.fetchUser();
  }
  render() {
    return (
      <div className="App">
        <Router>
          <Header />

          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/createlevel/:levelId"
              component={LevelCreator}
            />

            <Route exact path="/level/:levelId" component={LevelDetails} />
          </Switch>
        </Router>
        {/* <LevelCreator /> */}

        {/* <LevelDetails /> */}

        {/* <GameView /> */}
        {/* <Home /> */}
      </div>
    );
  }
}

export default connect(
  null,
  { fetchUser }
)(App);
