require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const chalk = require("chalk");
const exphbs = require("express-handlebars");
require("./models");
const app = express();
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
    helpers: {},
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/browser", express.static(path.join(__dirname, "browser")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/levelCreator", express.static(path.join(__dirname, "levelCreator")));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/createLevel", function(req, res) {
  res.render("levelCreator/levelCreator");
});

app.use("/api/users", require("./routes/users"));
app.use("/api/levels", require("./routes/levels"));

const port = 5000;
app.listen(port, () => {
  //console.log(process.env.MONGOURI);
  console.log("Server eavesdropping on 5000");
});
