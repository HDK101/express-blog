const mongoose = require("mongoose");
const { Increment } = require("./models/increment");
const { Admin } = require("./models/admin");

console.log("This command should be executed this way: ");
console.log("npm run prepare <user> <password> <key>");

const promise = new Promise(function(resolve, reject) {
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
})
  .then(function() {
    let incCount = 0;
    Increment.countDocuments({ id: "increment" }, function(err, count) {
      if (err) throw err;
      incCount = count;
    });
    return incCount;
  })
  .then(function(count) {
    incrementDb = new Increment({
      post: 0,
      admin: 0,
      user: 0,
      comment: 0,
      id: "increment"
    });
    if (count == 0) {
      incrementDb.save(function(err) {
        if (err) throw err;
        console.log("Increment saved!");
      });
    }
  })
  .then(function() {
    let adminCount = 0;
    Admin.countDocuments({ id: 0, main: true }, function(err, count) {
      if (err) throw err;
      adminCount = count;
    });
    return adminCount;
  })
  .then(function(count) {
    if (!process.argv[2] || !process.argv[3]) throw "Empty name or email!";

    mainAdminDb = new Admin({
      name: process.argv[2],
      password: process.argv[3],
      email: "",
      main: true,
      id: count
    });

    if (count == 0) {
      mainAdminDb.save(function(err) {
        if (err) throw err;
        console.log("Main admin created!");
      });
    }
    return
  })
  .catch(function(error) {
    console.log("Error! " + error);
    process.exit();
  })
  .finally(function() {
    setTimeout(function() {
      console.log("Timeout!");
      process.exit();
    }, 6000);
  });

// mainAdminDb = new Admin({
//   name: String,
//   password: String,
//   email: String,
//   id: Number
// });
