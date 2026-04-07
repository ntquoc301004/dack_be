function toPascalCase(value) {
  const sanitized = String(value || "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (!sanitized) {
    throw new Error("namingRule violation: Model name is required.");
  }

  return sanitized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function validateModelName(modelName) {
  const normalized = toPascalCase(modelName);
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(normalized);
  if (!isPascalCase) {
    throw new Error("namingRule violation: Model name must be PascalCase.");
  }
  return normalized;
}

module.exports = {
  name: "namingRule",
  description: "Ensure Mongoose model names are in PascalCase.",
  apply(context) {
    if (!context || !context.modelName) {
      return context;
    }
    return {
      ...context,
      modelName: validateModelName(context.modelName)
    };
  }
};
