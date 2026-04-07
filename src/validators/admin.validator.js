const Joi = require("joi");

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("user", "admin").required(),
});

const authorSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  bio: Joi.string().allow("").max(5000).optional(),
  avatar: Joi.string().allow("").optional(),
  website: Joi.string().allow("").optional(),
  birthDate: Joi.date().allow(null).optional(),
  nationality: Joi.string().allow("").max(100).optional(),
  isActive: Joi.boolean().optional(),
});

const updatePaymentStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "paid", "failed", "refunded").required(),
  transactionId: Joi.string().allow("").optional(),
  failureReason: Joi.string().allow("").optional(),
});

module.exports = {
  updateUserRoleSchema,
  authorSchema,
  updatePaymentStatusSchema,
};
