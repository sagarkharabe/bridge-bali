var chalk = require("chalk");
var fs = require("fs");

function canvasToPngStream(canvas) {
  return canvas.pngStream();
}

function canvasToJpegStream(canvas) {
  return canvas.jpegStream();
}

function streamToFile(stream, filename) {
  return new Promise(function(ok, fail) {
    console.log("Writing canvas data to", chalk.yellow(filename), ". . .");
    var out = fs.createWriteStream(filename);

    stream.on("data", function(chunk) {
      out.write(chunk);
    });

    stream.on("end", function() {
      out.end();
      console.log(chalk.green("Saved data successfully!"));
      ok();
    });
  });
}

module.exports = {
  canvasToPNG: canvasToPngStream,
  canvasToJPEG: canvasToJpegStream,
  streamToFile: streamToFile
};
