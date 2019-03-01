const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 5000;
app.listen(port, () => {
  console.log("Server eavesdropping on 5000");
});
