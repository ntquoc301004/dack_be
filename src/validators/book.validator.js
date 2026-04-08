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

const updateBookSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  author: Joi.string().min(1).max(120),
  price: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  description: Joi.string().allow(""),
  image: Joi.string().allow(""),
  category: Joi.string(),
}).min(1);

module.exports = { bookSchema, updateBookSchema };
