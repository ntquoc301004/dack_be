function extractPasswordMinLength(code) {
  const regex = /minlength\s*:\s*(\d+)/i;
  const match = String(code || "").match(regex);
  return match ? Number(match[1]) : null;
}

module.exports = {
  name: "securityRule",
  description: "Ensure password has at least 6 characters.",
  apply(context) {
    if (!context || !context.code) {
      return context;
    }

    const lowerIntent = String(context.intent || "").toLowerCase();
    const isAuthRelated = lowerIntent.includes("auth") || lowerIntent.includes("user");
    if (!isAuthRelated) {
      return context;
    }

    const minLen = extractPasswordMinLength(context.code);
    if (minLen !== null && minLen < 6) {
      throw new Error("securityRule violation: password minlength must be >= 6.");
    }

    if (context.code.includes("password") && minLen === null) {
      throw new Error("securityRule violation: password field must define minlength >= 6.");
    }

    return context;
  }
};
