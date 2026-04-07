const generateModel = require("./generateModel");
const generateAPI = require("./generateAPI");
const generateController = require("./generateController");
const authHandler = require("./authHandler");
const databaseConnector = require("./databaseConnector");
const validationHandler = require("./validationHandler");

module.exports = {
  generateModel,
  generateAPI,
  generateController,
  authHandler,
  databaseConnector,
  validationHandler,
  defaultSkills: {
    generateModel,
    generateAPI,
    generateController,
    authHandler,
    databaseConnector,
    validationHandler
  }
};
