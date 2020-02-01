const fs = require("fs");

/*
WARNING!
Config parser should be called on the server initialization!
*/

let config = {};

/**
 *
 * @param { Object } settings - An object with the following settings:
 * *  port,
 * *  secretKey
 * *  NOTE 1: Should not be used in real-time!
 * *  NOTE 2: secretKey should be generated randomly
 * @param { Boolean } test - Used for tests, false by default
 */
function setConfig(configToSet, test) {
  config = Object.assign(config, configToSet);
  configJSON = JSON.stringify(config);
  if (typeof test != undefined) {
    test && fs.writeFileSync(__dirname + "/configTest.json", configJSON);
    !test && fs.writeFileSync(__dirname + "/config.json", configJSON);
  }
  console.log("Configuration file created!");
}

/**
 * Reset configuration
 * @param { Boolean } test - Used for tests, false by default
 * *  NOTE 1: Should not be used in real-time!
 */
function resetConfig(test) {
  configJSON = JSON.stringify({ initialized: false });
  fs.writeFileSync(__dirname + "/config.json", configJSON);
  if (typeof test != undefined) {
    test && fs.writeFileSync(__dirname + "/configTest.json", configJSON);
    !test && fs.writeFileSync(__dirname + "/config.json", configJSON);
  }
  console.log("Configuration file reseted!");
}

/**
 * @param { Boolean } test - Used for tests, false by default
 * Returns configuration(Config.json),
 * should be stored in a constant
 */
function getConfig(test) {
  let config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
  if (typeof test != undefined) {
    !test
      ? (config = JSON.parse(fs.readFileSync(__dirname + "/config.json")))
      : (config = JSON.parse(fs.readFileSync(__dirname + "/configTest.json")));
  }
  if (config.initialized == "false")
    throw "Configuration file is not initialized!";
  return config;
}

module.exports = { setConfig, getConfig, resetConfig };
