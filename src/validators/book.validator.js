const Joi = require("joi");

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  author: Joi.string().min(1).max(120).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  description: Joi.string().allow("").optional(),
  image: Joi.string().allow("").optional(),
  category: Joi.string().required(),
});

module.exports = { bookSchema };
