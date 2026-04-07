module.exports = {
  name: "authHandler",
  description: "Generate authentication model/controller snippets with security defaults.",
  execute(input) {
    const modelName = input.modelName || "User";

    return `const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ${modelName}Schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

${modelName}Schema.pre("save", async function preSave(next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("${modelName}", ${modelName}Schema);
`;
  }
};
