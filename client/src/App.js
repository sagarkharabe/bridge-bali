import React, { Component } from "react";
import "./App.css";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { fetchUser } from "./actions/authAction";
import PrivateRoute from "./auth/PrivateRoute";
import Home from "./components/container/Home/Home";
import Header from "./components/presentaional/header/Header";
import LevelCreator from "./components/container/LevelCreator/LevelCreator";
import LevelDetails from "./components/presentaional/LevelDetails/LevelDetails";
import Builder from "./components/presentaional/Builder/Builder";
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
    console.log("Fetch user called in App");
    this.eventEmitter = window.eventEmitter;
    if (window.game) {
      console.log("Cleaning up old game...");
      window.game.destroy();
    }
  }

  render() {
    // Protected Component

    return (
      <div className="App">
        <Router>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            {this.props.auth.isLoaded && (
              <React.Fragment>
                <PrivateRoute exact path="/builder" component={Builder} />
                {/* <Route exact path="/builder" component={Builder} /> */}
                <Route
                  exact
                  path="/createlevel/:levelId"
                  component={LevelCreator}
                />
                <Route exact path="/level/:levelId" component={LevelDetails} />
              </React.Fragment>
            )}
          </Switch>
        </Router>
      </div>
    );
  }
}
const mapStateToProps = ({ auth }) => ({
  auth
});
export default connect(
  mapStateToProps,
  { fetchUser }
)(App);
