const fs = require("fs");

/*
WARNING!
Config parser should be called on the server initialization!
*/

let config = {};

/**
 *
 * @param { Object } settings - An object with the following settings:
 * port,
 * secretKey
 * *  NOTE 1: Should not be used in real-time!
 * *  NOTE 2: secretKey should be generated randomly
 */
function setConfig(configToSet) {
  config = Object.assign(config, configToSet);
  configJSON = JSON.stringify(config);
  fs.writeFileSync(__dirname + "/config.json", configJSON);
  console.log("Configuration file created!");
}

/**
 * Reset configuration
 * *  NOTE 1: Should not be used in real-time!
 */
function resetConfig() {
  configJSON = JSON.stringify({ initialized: false });
  fs.writeFileSync(__dirname + "/config.json", configJSON);
  console.log("Configuration file reseted!");
}

/**
 * Returns configuration(Config.json),
 * should be stored in a constant
 */
function getConfig() {
  config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
  if (config.initialized == "false")
    throw "Configuration file is not initialized!";
  return config;
}

module.exports = { setConfig, getConfig, resetConfig };
