module.exports = {
  name: "generateController",
  description: "Generate CRUD controller with async try-catch handlers.",
  execute(input) {
    const resource = input.resource || "book";
    const modelName = input.modelName || "Book";
    const plural = resource.endsWith("s") ? resource : `${resource}s`;

    return `const ${modelName} = require("../models/${modelName}");

exports.get${modelName}List = async (req, res, next) => {
  try {
    const items = await ${modelName}.find();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.get${modelName}ById = async (req, res, next) => {
  try {
    const item = await ${modelName}.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "${modelName} not found" });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.create${modelName} = async (req, res, next) => {
  try {
    const item = await ${modelName}.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.update${modelName} = async (req, res, next) => {
  try {
    const item = await ${modelName}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: "${modelName} not found" });
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.delete${modelName} = async (req, res, next) => {
  try {
    const item = await ${modelName}.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "${modelName} not found" });
    }
    return res.status(200).json({ success: true, message: "${plural} deleted" });
  } catch (error) {
    next(error);
  }
};
`;
  }
};
