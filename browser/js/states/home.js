const eventEmitter = window.eventEmitter;

eventEmitter.on("what level to play", () => {
  eventEmitter.emit("play this level", ["default"]);
});
