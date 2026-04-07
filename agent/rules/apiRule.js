function ensureApiPrefix(context) {
  if (!context || !context.code) {
    return context;
  }

  const intent = String(context.intent || "").toLowerCase();
  if (intent !== "generateapi") {
    return context;
  }

  const apiPrefix = context.apiPrefix || "/api/v1";
  if (!context.code.includes(apiPrefix)) {
    throw new Error(`apiRule violation: API code must include prefix "${apiPrefix}".`);
  }

  return context;
}

module.exports = {
  name: "apiRule",
  description: "Ensure RESTful APIs use /api/v1 prefix.",
  apply: ensureApiPrefix
};
