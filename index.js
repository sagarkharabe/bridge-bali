require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const chalk = require("chalk");
const exphbs = require("express-handlebars");
require("./models");
const app = express();
const { toggleTesting } = require("./hbshelpers/createLevel");
//require("./config/app-variables")(app);

MONGOURI = "mongodb://sagar:sagar5544@ds259820.mlab.com:59820/new-mario-db";
mongoose.Promise = global.Promise;
mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true
  })
  .then(() => {
    console.log(chalk.green("Connected to Mlab.."));
  })
  .catch(err => {
    console.log(chalk.red("Mlab connection error -- "), err);
  });

app.engine(
  "handlebars",
  exphbs({
    helpers: {
      toggleTesting
    },
    defaultLayout: "main"
  })
);

app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/browser", express.static(path.join(__dirname, "browser")));
app.use(
  "/browser/stylesheets",
  express.static(path.join(__dirname, "browser/stylesheets"))
);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/levelCreator", express.static(path.join(__dirname, "levelCreator")));
app.use(express.static(path.join(__dirname, "node_modules")));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/createLevel", function(req, res) {
  res.render("levelCreator/levelCreator", {
    toolArr: toolArr
  });
});
app.get("/testLevel", function(req, res) {
  res.render("levelCreator/levelTester", {
    toolArr: toolArr,
    testing: false
  });
});

app.use("/api/users", require("./routes/users"));
app.use("/api/levels", require("./routes/levels"));

const port = 5000;
app.listen(port, () => {
  //console.log(process.env.MONGOURI);
  console.log("Server eavesdropping on 5000");
});

var toolArr = {
  Eraser: {
    img: "game/assets/images/eraser.png",
    tile: "Eraser"
  },
  Gus: {
    img: "game/assets/images/gus-static.png",
    tile: "Gus"
  },
  "Red Brick": {
    img: "game/assets/images/brick_red.png",
    tile: "RedBrickBlock"
  },
  "Black Brick": {
    img: "game/assets/images/brick_black.png",
    tile: "BlackBrickBlock"
  },
  "Break Brick": {
    img: "game/assets/images/brick_break.png",
    tile: "BreakBrickBlock"
  },
  Spike: {
    img: "game/assets/images/spike.png",
    tile: "Spike"
  },
  Tool: {
    img: "game/assets/images/tool.png",
    tile: "Tool"
  }
};
