const { Admin, Increment } = require("./models/models");
const { setConfig } = require("./Server/configParser");
const { encrypt } = require("./components/crypto");
const mongoose = require("mongoose");

if (!process.argv[2] || !process.argv[3]) throw "Empty name or email!";

mainAdminDb = new Admin({
  name: process.argv[2],
  password: process.argv[3],
  email: "",
  main: true,
  id: 0
});
incrementDb = new Increment();

function setConfigJSON() {
  promise = new Promise(function(resolve, reject) {
    function generateKey() {
      let key = "";
      while (key.length < 32) {
        key += Math.round(Math.random() * 10);
      }
      return key;
    }
    const generatedKey = generateKey();
    config = { port: 3000, secretKey: generatedKey, initialized: true };
    setConfig(config);
    resolve();
  });
  return promise;
}

function initializeMongoose() {
  promise = new Promise(function(resolve, reject) {
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useFindAndModify", false);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useUnifiedTopology", true);

    mongoose.connect("mongodb://localhost/blogsys");
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
function checkAdminExistence() {
  promise = new Promise(function(resolve, reject) {
    Admin.countDocuments({ id: 0, main: true }, function(err, count) {
      if (err) reject(err);
      resolve(count);
    });
  });
  return promise;
}

function createAdmin(count) {
  promise = new Promise(function(resolve, reject) {
    if (count == 0) {
      console.log("No main admin was found, creating...");
      mainAdminDb.save(function(err) {
        if (err) reject(err);
        console.log("Main admin created!");
        resolve();
      });
    } else {
      console.log("Main admin already exists");
      resolve();
    }
  });
  return promise;
}

function checkIncrementExistence() {
  promise = new Promise(function(resolve, reject) {
    Increment.countDocuments({}, function(err, count) {
      if (err) reject(err);
      resolve(count);
    });
  });
  return promise;
}

function createIncrement(count) {
  promise = new Promise(function(resolve, reject) {
    if (count == 0) {
      console.log("No increment was found, creating...");
      incrementDb.save(function(err) {
        if (err) reject(err);
        console.log("Increment created!");
        resolve();
      });
    } else {
      console.log("Increment already exists");
      resolve();
    }
  });
  return promise;
}

initializeMongoose()
  .then(setConfigJSON)
  .then(checkAdminExistence)
  .then(createAdmin)
  .then(checkIncrementExistence)
  .then(createIncrement)
  .finally(function() {
    console.log("Everything done!");
    process.exit();
  })
  .catch(function(error) {
    console.log("Error:" + error);
  });
