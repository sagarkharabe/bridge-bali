import chalk from "chalk";
import Promise from "bluebird";
import s3 from "s3";

import SECRETS from "../../secrets";

const client = s3.createClient({
  s3Options: {
    accessKeyId: SECRETS.S3.accessKeyId,
    secretAccessKey: SECRETS.S3.secretAccessKey
  }
});

function uploadMapThumb(imagePath, levelId) {
  const params = {
    localFile: imagePath,
    s3Params: {
      Bucket: "girder-gus",
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
    uploader.on("end", function() {
      console.log(chalk.green("Canvas data uploaded to S3."));
      console.log("Removing local copy...");
      resolve();
    });
  });
}

module.exports = uploadMapThumb;
