const chalk = require("chalk");
const Promise = require("bluebird");
const s3 = require("s3");
// const S3FS = require("s3fs");
// const fsImpl = new S3FS("bridge-bali-test", {
//   accessKeyId: "AKIA3FV3OEFRZHUD4S7U",
//   secretAccessKey: "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",
//   signatureVersion: "v4"
// });

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
      Bucket: "bridge-bali-test",
      Key: levelId + ".png"
    }
  };

  // fsImpl.writeFile("message.txt", "Hello Node").then(
  //   function() {
  //     console.log("It's saved!");
  //   },
  //   function(reason) {
  //     throw reason;
  //   }
  // );

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
