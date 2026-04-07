const { defaultConfig } = require("../config");
const { defaultSkills } = require("../skills");
const { defaultRules } = require("../rules");

class AgentEngine {
  constructor(options = {}) {
    this.config = { ...defaultConfig, ...(options.config || {}) };
    this.skills = { ...defaultSkills, ...(options.skills || {}) };
    this.rules = [...defaultRules, ...(options.rules || [])];
  }

  registerSkill(skill) {
    if (!skill || !skill.name || typeof skill.execute !== "function") {
      throw new Error("Invalid skill: skill must include name and execute(input).");
    }
    this.skills[skill.name] = skill;
  }

  registerRule(rule) {
    if (!rule || !rule.name || typeof rule.apply !== "function") {
      throw new Error("Invalid rule: rule must include name and apply(context).");
    }
    this.rules.push(rule);
  }

  parseNaturalRequest(request = "") {
    const text = String(request || "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (text.includes("tao model") || text.includes("create model")) {
      return { skillName: "generateModel" };
    }
    if (text.includes("tao api") || text.includes("create api")) {
      return { skillName: "generateAPI" };
    }
    if (text.includes("tao controller") || text.includes("create controller")) {
      return { skillName: "generateController" };
    }
    if (text.includes("auth")) {
      return { skillName: "authHandler" };
    }
    if (text.includes("database") || text.includes("mongo")) {
      return { skillName: "databaseConnector" };
    }
    if (text.includes("validation") || text.includes("validate")) {
      return { skillName: "validationHandler" };
    }
    if (
      text.includes("backend ban sach day du") ||
      text.includes("tao backend ban sach day du") ||
      text.includes("backend book store full")
    ) {
      return { skillName: "fullBackendBlueprint" };
    }

    throw new Error("Cannot resolve request to a known skill.");
  }

  runRules(context) {
    return this.rules.reduce((acc, rule) => rule.apply(acc), context);
  }

  executeSkill(skillName, input) {
    const skill = this.skills[skillName];
    if (!skill) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    const rawCode = skill.execute(input);
    const validated = this.runRules({
      ...input,
      intent: skillName,
      code: rawCode,
      apiPrefix: this.config.apiPrefix
    });

    return {
      skill: skillName,
      output: validated.code
    };
  }

  process(request, input = {}) {
    const parsed = this.parseNaturalRequest(request);

    if (parsed.skillName === "fullBackendBlueprint") {
      const modelName = input.modelName || "Book";
      const resource = (input.resource || "books").toLowerCase();
      const baseInput = {
        ...input,
        modelName,
        resource,
        apiPrefix: this.config.apiPrefix
      };

      const model = this.executeSkill("generateModel", baseInput);
      const controller = this.executeSkill("generateController", baseInput);
      const api = this.executeSkill("generateAPI", baseInput);

      return {
        intent: "fullBackendBlueprint",
        generated: {
          model: model.output,
          controller: controller.output,
          api: api.output
        }
      };
    }

    const baseInput = {
      ...input,
      modelName: input.modelName || "Book",
      resource: (input.resource || "books").toLowerCase(),
      apiPrefix: this.config.apiPrefix
    };

    const result = this.executeSkill(parsed.skillName, baseInput);
    return {
      intent: parsed.skillName,
      generated: result.output
    };
  }
}

module.exports = AgentEngine;
