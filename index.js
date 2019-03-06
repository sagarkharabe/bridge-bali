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
const inlineScript = require("express-handlebars-inline-script");

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
      inlineScript:
        process.env.NODE_ENV === "production"
          ? inlineScript.inline
          : inlineScript.noinline
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var script = [
  { script: "/game/js/phaser.js" },
  { script: "/public/girder-gus-test.js" }
];
app.use(express.static("public"));
app.use(express.static("game/js"));
app.get("/", (req, res) => {
  res.render("home", { script: script });
});

app.use("/users", require("./routes/users"));
app.use("/levels", require("./routes/levels"));

const port = 5000;
app.listen(port, () => {
  //console.log(process.env.MONGOURI);
  console.log("Server eavesdropping on 5000");
});
