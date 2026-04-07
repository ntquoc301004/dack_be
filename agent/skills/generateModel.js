function buildSchemaFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return `  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" }`;
  }

  return fields
    .map((field) => {
      const name = field.name || "fieldName";
      const type = field.type || "String";
      const required = field.required ? "true" : "false";
      const extra = field.extra ? `, ${field.extra}` : "";
      return `  ${name}: { type: ${type}, required: ${required}${extra} }`;
    })
    .join(",\n");
}

module.exports = {
  name: "generateModel",
  description: "Generate a Mongoose model schema for a resource.",
  execute(input) {
    const modelName = input.modelName || "Book";
    const fields = buildSchemaFields(input.fields);
    const code = `const mongoose = require("mongoose");

const ${modelName}Schema = new mongoose.Schema(
{
${fields}
},
{
  timestamps: true
}
);

module.exports = mongoose.model("${modelName}", ${modelName}Schema);
`;

    return code;
  }
};
