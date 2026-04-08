const Joi = require("joi");

const createOrderSchema = Joi.object({
  shippingAddress: Joi.string().allow("", null).min(5).optional(),
  paymentMethod: Joi.string()
    .valid("cod", "bank_transfer", "momo", "vnpay", "paypal", "stripe", "COD")
    .required(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "shipping", "completed", "cancelled").required(),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
