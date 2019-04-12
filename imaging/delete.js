const chalk = require("chalk");
const fs = require("fs");
const Promise = require("bluebird");

function deleteLocalMapThumb(path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, err => {
      if (err) reject();
      else {
        console.log(chalk.green("Local copy of canvas data deleted!"));
        resolve();
      }
    });

    resolve();
  });
}

module.exports = deleteLocalMapThumb;
