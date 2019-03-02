const path = require("path");

const rootPath = path.join(__dirname, "../");

const indexPath = path.join(rootPath, "./views/index.html");
module.exports = function(app) {
  app.set("indexHTMLPath", indexPath);
};
