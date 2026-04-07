const Joi = require("joi");

const reviewSchema = Joi.object({
  bookId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow("").optional(),
});

module.exports = { reviewSchema };
