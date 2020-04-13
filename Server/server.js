const { getConfig } = require("./configParser");
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

app.set("view engine", "ejs");

app.use(express.static("static"));

app.use(cookieparser(config.secretKey));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

/**
 * Connect to blog database(MongoDB)
 * @param { String } name - Blog name
 * @param { Boolean } test - false by default
 */
function connect(name, test) {
  if (typeof test === "undefined") {
    mongoose.connect(`mongodb://localhost/${name}_blog`);
  } else if (test) {
    mongoose.connect(`mongodb://localhost/${name}_blog_test`);
  }
  const db = mongoose.connection;
  db.on("error", console.error.bind("Connection failure"));
  db.on("open", function() {
    console.log("DB connected!");
  });
}

function closeConnection() {
  const db = mongoose.connection;
  db.close(function(err) {
    if (err) throw err;
    console.log("Connection to DB closed.");
  });
}

function listen() {
  app.listen(port, function(err) {
    if (err) console.log(err);
    console.log("Server initialized in port " + port);
  });
}

module.exports = { connect, closeConnection, listen, app, config };
