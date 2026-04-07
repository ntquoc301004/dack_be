function hasTryCatch(code) {
  return /try\s*\{[\s\S]*\}\s*catch\s*\(/m.test(String(code || ""));
}

module.exports = {
  name: "codingRule",
  description: "Ensure generated controllers include try-catch blocks.",
  apply(context) {
    if (!context || !context.code) {
      return context;
    }

    const requiresTryCatch = ["generatecontroller", "authhandler", "generateapi"].includes(
      String(context.intent || "").toLowerCase()
    );

    if (requiresTryCatch && !hasTryCatch(context.code)) {
      throw new Error("codingRule violation: generated code must include try-catch.");
    }

    return context;
  }
};
