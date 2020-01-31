const { getConfig } = require("./configParser");
const mongoose = require("mongoose");
const express = require("express");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");

var test = false;

const config = getConfig();

const app = express();

const port = process.env.port ? process.env.port : config.port;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

/**
 * Connect to MongoDB
 * @param { Object } options - { test: false } by default
 */
function connect(options) {
  if (typeof options === "undefined") {
    mongoose.connect("mongodb://localhost/blogsys");
  } else {
    if (options.test == true) {
      test = true;
      mongoose.connect("mongodb://localhost/blog_test");
    }
  }
  const db = mongoose.connection;
  db.on("error", console.error.bind("Connection failure"));
  db.on("open", function() {
    console.log("DB connected!");
  });
}

function clearTestDatabase() {
  const db = mongoose.connection;
  if (test) db.dropDatabase();
  else console.log("Can't clear database in production mode.");
}

app.set("view engine", "ejs");

app.use(cookieparser(config.secretKey));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.listen(port, function(err) {
  if (err) console.log(err);
  console.log("Server initialized in port " + port);
});

module.exports = { connect, clearTestDatabase, app, mongoose, config };
