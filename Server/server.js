const { getConfig } = require("./configParser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const express = require("express");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");

const config = getConfig();

const app = express();

const port = process.env.port ? process.env.port : config.port;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost/blogsys");
const db = mongoose.connection;
db.on("error", console.error.bind("Connection failure"));
db.on("open", function() {
  console.log("DB connected!");
});

app.set("view engine", "ejs");

app.use(cookieparser(config.secretKey));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.listen(port, function(err) {
  if (err) console.log(err);
  console.log("Server initialized in port " + port);
});

module.exports = { app, ejs, mongoose, config };
