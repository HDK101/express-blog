const { Admin, Increment } = require("./models/models");
const { setConfig } = require("./Server/configParser");
const readline = require("readline");
const mongoose = require("mongoose");
const { encrypt } = require("./components/crypto");

/*Models */
var mainAdminDb;
incrementDb = new Increment();

/*Main admin credentials*/
var adminName, adminEmail, adminPassword;

/*Blog settings*/
var blogName, blogPort; 

/*Blog key*/
var blogKey;

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/*****************
Questions promises
*****************/
function askAdminName() {
  promise = new Promise(function(resolve) {
    reader.question("What's the main admin name?\n", function(answer) {
      console.log("Okay then.");
      adminName = answer;
      resolve();
    });
  });
  return promise;
}

function askAdminEmail() {
  promise = new Promise(function(resolve) {
    reader.question("What's the main admin email?\n", function(answer) {
      console.log("Okay then.");
      adminEmail = answer;
      resolve();
    });
  });
  return promise;
}

function askAdminPassword() {
  promise = new Promise(function(resolve) {
    reader.question("What's the main admin password?\n", function(answer) {
      console.log("Okay then.");
      adminPassword = answer;
      resolve();
    });
  });
  return promise;
}

function askBlogName() {
  promise = new Promise(function(resolve) {
    reader.question("Blog name?(or codename?)\n", function(answer) {
      console.log("Blog name set to " + answer);
      blogName = answer;
      resolve();
    });
  });
  return promise;
}

function askBlogPort() {
  promise = new Promise(function(resolve) {
    reader.question("Which port should be used?\n", function(answer) {
      console.log("Port set to " + answer);
      blogPort = answer;
      resolve();
    });
  });
  return promise;
}

/********************
Configuration promise
********************/
function setConfigJSON() {
  promise = new Promise(function(resolve, reject) {
    function generateKey() {
      let key = "";
      while (key.length < 32) {
        key += Math.round(Math.random() * 10);
      }
      return key;
    }
    blogKey = generateKey();
    config = {
      blogName: blogName,
      port: blogPort,
      secretKey: blogKey,
      initialized: true
    };
    setConfig(config);
    resolve();
  });
  return promise;
}

/****************
Database promises
****************/


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
    mainAdminDb = new Admin({
      name: adminName,
      email: adminEmail,
      password: encrypt(adminPassword, blogKey),
      main: true,
      id: 0
    });
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

/*Question promises*/
askAdminName()
  .then(askAdminEmail)
  .then(askAdminPassword)
  .then(askBlogName)
  .then(askBlogPort)
  .then(setConfigJSON)
  .then(initializeMongoose)
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
