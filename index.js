require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const chalk = require("chalk");
const session = require("express-session");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
require("./models");
const app = express();
require("./config/passport");

const MONGOURI = process.env.MONGOURI;
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 30 * 24 * 60 * 60 * 1000
//     }
//   })
// );

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: ["asdfasdfa"]
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/levelCreator", express.static(path.join(__dirname, "levelCreator")));
app.use(express.static(path.join(__dirname, "node_modules")));
//app.use(favicon(app.getValue('faviconPath')));

app.use("/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/statistics", require("./routes/statistics"));
app.use("/api/levels", require("./routes/levels"));

const port = 5000;
app.listen(port, () => {
  //console.log(process.env.MONGOURI);
  console.log("Server eavesdropping on 5000");
});
