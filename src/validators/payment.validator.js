const Joi = require("joi");

const paymentWebhookSchema = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().valid("pending", "paid", "failed", "refunded").required(),
  transactionId: Joi.string().allow("").optional(),
  failureReason: Joi.string().allow("").optional(),
  metadata: Joi.object().optional(),
});

module.exports = { paymentWebhookSchema };
