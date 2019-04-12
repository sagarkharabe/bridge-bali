const chalk = require("chalk");
const Promise = require("bluebird");
const s3 = require("s3");

const client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.s3AccessKeyId,
    secretAccessKey: process.env.s3SecretAccessKey
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
