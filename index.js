require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const chalk = require("chalk");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require("./models");
const app = express();
const favicon = require("serve-favicon");
app.use(require("prerender-node"));
//require("./config/app-variables")(app);
const allowedHost = "http://localhost:3000";
MONGOURI = process.env.MONGOURI;
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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", allowedHost);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");
app.use("/browser", express.static(path.join(__dirname, "browser")));
app.use(
  "/browser/stylesheets",
  express.static(path.join(__dirname, "browser/stylesheets"))
);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/levelCreator", express.static(path.join(__dirname, "levelCreator")));
app.use(express.static(path.join(__dirname, "node_modules")));
//app.use(favicon(app.getValue('faviconPath')));

app.use("/api/users", require("./routes/users"));
app.use("/api/statistics", require("./routes/statistics"));
app.use("/api/levels", require("./routes/levels"));
app.use("/auth", require("./routes/auth"));
const port = 5000;
app.listen(port, () => {
  //console.log(process.env.MONGOURI);
  console.log("Server eavesdropping on 5000");
});
