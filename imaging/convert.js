var chalk = require("chalk");
var fs = require("fs");

function canvasToPngStream(canvas) {
  return canvas.pngStream();
}

function canvasToJpegStream(canvas) {
  return canvas.jpegStream();
}

function streamToFile(stream, filename) {
  console.log("Writing canvas data to", chalk.yellow(filename), ". . .");
  var out = fs.createWriteStream(filename);

  stream.on("data", function(chunk) {
    out.write(chunk);
  });

  stream.on("end", function() {
    out.end();
    console.log("Saved data successfully!");
  });

  return stream;
}

module.exports = {
  canvasToPNG: canvasToPngStream,
  canvasToJPEG: canvasToJpegStream,
  streamToFile: streamToFile
};
