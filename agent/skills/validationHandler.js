module.exports = {
  name: "validationHandler",
  description: "Generate Joi validation schema middleware.",
  execute(input) {
    const resource = input.resource || "book";

    return `const Joi = require("joi");

const ${resource}Schema = Joi.object({
  title: Joi.string().trim().min(2).required(),
  author: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).default(0)
});

module.exports = (req, res, next) => {
  const { error, value } = ${resource}Schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message)
    });
  }
  req.body = value;
  return next();
};
`;
  }
};
