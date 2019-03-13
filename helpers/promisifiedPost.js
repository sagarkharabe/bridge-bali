const Promise = require("bluebird");
const request = require("request");

function post(url, dataObj) {
  return new Promise((resolve, reject) => {
    let data = "";

    const options = {
      uri: url,
      body: dataObj,
      json: true
    };

    request.post(options, (err, res, body) => {
      if (err) reject(err);
      else resolve(body);
    });
  });
}

module.exports = post;
