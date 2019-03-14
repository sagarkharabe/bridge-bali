import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
const events = require("events");
const eventEmitter = new events.EventEmitter();
eventEmitter.only = function(event, callback) {
  this.removeAllListeners(event);
  return this.on(event, callback);
};
eventEmitter.on("loaded", () => {
  console.log("\n\ncreator loaded\n\n");
});
window.eventEmitter = eventEmitter;
// eventEmitter.on("what level to play", () => {
//   eventEmitter.emit("play this level", ["default"]);
// });
ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.unregister();
