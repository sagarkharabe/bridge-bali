const events = require("events");
var eventEmitter = new events.EventEmitter();
eventEmitter.only = function(event, callback) {
  this.removeAllListeners(event);
  return this.on(event, callback);
};

eventEmitter.on("loaded", () => {
  console.log("\n\n##creator loaded\n\n");
});
// eventEmitter.on("what level to play", () => {
//   eventEmitter.emit("play this level", ["default"]);
// });

window.eventEmitter = eventEmitter;
