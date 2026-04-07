const codingRule = require("./codingRule");
const apiRule = require("./apiRule");
const securityRule = require("./securityRule");
const namingRule = require("./namingRule");

module.exports = {
  codingRule,
  apiRule,
  securityRule,
  namingRule,
  defaultRules: [codingRule, apiRule, securityRule, namingRule]
};
