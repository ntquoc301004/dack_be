const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().allow("", null).max(30),
  city: Joi.string().allow("", null).max(100),
  district: Joi.string().allow("", null).max(100),
  ward: Joi.string().allow("", null).max(100),
  streetAddress: Joi.string().allow("", null).max(255),
})
  .min(1)
  .messages({
    "object.min": "At least one profile field is required",
  });

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { updateProfileSchema, changePasswordSchema };
