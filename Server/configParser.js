const fs = require("fs");

function readJSON() {
  promise = new Promise(function(resolve, reject) {
    fs.readFile(__dirname + "/config.json", function(err, json) {
      if (err) reject(err);
      const parse = JSON.parse(json);
      resolve(parse);
    });
  });
  return promise;
}

readJSON();
