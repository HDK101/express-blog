const fs = require("fs");

/*
WARNING!
Config parser should be called on the server initialization!
*/

let config = {};
config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));

module.exports = { config };
