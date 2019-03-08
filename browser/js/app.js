const events = require("events");
const eventEmitter = new events.EventEmitter();

eventEmitter.on("loaded", () => {
  console.log("\n\n##creator loaded\n\n");
});
eventEmitter.on("what level to play", () => {
  eventEmitter.emit("play this level", ["default"]);
});
window.eventEmitter = eventEmitter;
