const Joi = require("joi");

const addToCartSchema = Joi.object({
  bookId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateCartSchema = Joi.object({
  bookId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const removeFromCartSchema = Joi.object({
  bookId: Joi.string().required(),
});

module.exports = { addToCartSchema, updateCartSchema, removeFromCartSchema };
