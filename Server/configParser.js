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
 * (NOTE 1: Should not be used in real-time!)
 * (NOTE 2: secretKey should be generated randomly)
 */
function setConfig(configToSet) {
  config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
  if (config.initialized == "false") {
    config = Object.assign(config, configToSet);
    configJSON = JSON.stringify(config);
    fs.writeFileSync(__dirname + "/config.json",configJSON);
    console.log("Configuration file created!");
  } else {
    console.log("Configuration file already created!");
  }
}

/**
 * Returns configuration(Config.json)
 * Should be stored in a constant
 */
function getConfig() {
  config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
  if (config.initialized == "false")
    throw "Configuration file is not initialized!";
  return config;
}

module.exports = { setConfig, getConfig };
