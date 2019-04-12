const chalk = require("chalk");
const Promise = require("bluebird");
const s3 = require("s3");

const client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.s3AccessKeyId,
    secretAccessKey: process.env.s3SecretAccessKey
  }
});

function uploadMapThumb(imagePath, levelId) {
  const params = {
    localFile: imagePath,
    s3Params: {
      Bucket: "bridge-bali",
      Key: levelId + ".png"
    }
  };

  const uploader = client.uploadFile(params);

  return new Promise((resolve, reject) => {
    uploader.on("error", function(err) {
      console.error("unable to upload:", JSON.stringify(err));
      console.error("unable to upload:", err.stack);
      reject();
    });
    uploader.on("progress", function() {
      console.log(
        "progress",
        uploader.progressMd5Amount,
        uploader.progressAmount,
        uploader.progressTotal
      );
    });
    uploader.on("end", function() {
      console.log(chalk.green("Canvas data uploaded to S3."));
      console.log("Removing local copy...");
      resolve();
    });
  });
}

module.exports = uploadMapThumb;
