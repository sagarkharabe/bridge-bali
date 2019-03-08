const events = require("events");
const eventEmitter = new events.EventEmitter();

eventEmitter.on("loaded", () => {
  console.log("\n\ncreator loaded\n\n");
});
window.eventEmitter = eventEmitter;
