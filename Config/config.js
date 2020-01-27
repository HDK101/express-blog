const express = require("express");
const bodyparser = require("body-parser");

const app = express();

const port = process.env.port ? process.env.port : 3000;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.listen(port, function(err) {
  if (err) console.log(err);
  console.log("Server initialized in port " + port);
});

module.exports = { app }
