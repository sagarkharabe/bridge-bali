import chalk from "chalk";
import Promise from "bluebird";
import s3 from "s3";

var env = require("../env");

const client = s3.createClient({
  s3Options: {
    accessKeyId: env.S3.ACCESS_KEY_ID,
    secretAccessKey: env.S3.SECRET_ACCESS_KEY
  }
});

function deleteServerThumb(levelId) {
  const params = {
    Bucket: "girder-gus",
    Delete: {
      Objects: [{ Key: levelId + ".png" }]
    }
  };

  const deleter = client.deleteObjects(params);

  return new Promise((resolve, reject) => {
    deleter.on("error", function(err) {
      console.error("unable to delete:", JSON.stringify(err));
      console.error(err.stack);
      reject(err);
    });
    deleter.on("end", function() {
      console.log(chalk.green("Canvas data deleted from S3."));
      resolve();
    });
  });
}

module.exports = deleteServerThumb;
