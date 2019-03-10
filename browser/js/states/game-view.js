const link = function() {
  const eventEmitter = window.eventEmitter;
  eventEmitter.emit("start input capture");
};
const stopInputCapture = function() {
  eventEmitter.emit("stop input capture");
};

const startInputCapture = function() {
  eventEmitter.emit("start input capture");
};
