const { Admin, Increment } = require("./models/models");
const { getConfig, resetConfig } = require("./Server/configParser");
const readline = require("readline");
const mongoose = require("mongoose");

const { blogName } = getConfig();

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askReset(value) {
  promise = new Promise(function(resolve, reject) {
    reader.question(`Are you sure you want to clear "${blogName}"?\n`, function(
      answer
    ) {
      if (answer == "yes" || answer == "y" || answer == "Y") resolve();
      else if (answer == "no" || answer == "n" || answer == "N") {
        reject("Reset cancelled.");
      }
      reader.close();
    });
  });
  return promise;
}

function initializeMongoose() {
  promise = new Promise(function(resolve, reject) {
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);

    mongoose.connect(`mongodb://localhost/${blogName}_blog`);
    const db = mongoose.connection;
    db.on("error", function() {
      reject("Connection failure!");
    });
    db.on("open", function() {
      resolve();
    });
  });
  return promise;
}

function clearConfiguration() {
  promise = new Promise(function(resolve) {
    resetConfig();
    resolve();
  });
  return promise;
}

function clearDB() {
  promise = new Promise(function(resolve) {
    const db = mongoose.connection;
    db.dropDatabase(function(err) {
      if (err) reject(err);
      console.log("Database cleared!");
      resolve();
    });
  });
  return promise;
}

askReset()
  .then(initializeMongoose)
  .then(clearConfiguration)
  .then(clearDB)
  .catch(function(error) {
    if (error != "Reset cancelled.") console.log("Error: " + error);
    else console.log(error);
  });
