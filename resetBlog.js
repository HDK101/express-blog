const { resetConfig, getConfig } = require("./Server/configParser");
const readline = require("readline");
const mongoose = require("mongoose");

const { blogName } = getConfig();

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/*****************
Questions promises
*****************/
function askDeleteDb() {
  promise = new Promise(function (resolve, reject) {
    reader.question(`Are you sure you want to clear ${blogName}\n`, function (
      answer
    ) {
      if (answer == "yes" || answer == "y" || answer == "Y") resolve();
      if (answer == "" || answer == "no" || answer == "n" || answer == "N")
        reject("Cancel");
    });
  });
  return promise;
}

/*********************
Configuration promises
*********************/

function clearConfig() {
  promise = new Promise(function (resolve) {
    resetConfig();
    resolve();
  });
}

/****************
Database promises
****************/

function initializeMongoose() {
  promise = new Promise(function (resolve, reject) {
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);

    mongoose.connect(`mongodb://localhost/${blogName}_blog`);
    const db = mongoose.connection;
    db.on("error", function () {
      reject("Connection failure!");
    });
    db.on("open", function () {
      db.dropDatabase();
      resolve();
    });
  });
  return promise;
}

/*Question promises*/
askDeleteDb()
  .then(clearConfig)
  .then(initializeMongoose)
  .then(function () {
    console.log("Everything done!");
    process.exit();
  })
  .catch(function (error) {
    console.log("Error: " + error);
    process.exit();
  });
