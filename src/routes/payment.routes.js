const express = require("express");
const {
  getMyPayments,
  getPaymentByOrder,
  paymentWebhook,
} = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { paymentWebhookSchema } = require("../validators/payment.validator");

const router = express.Router();

router.get("/my", authMiddleware, getMyPayments);
router.get("/order/:orderId", authMiddleware, getPaymentByOrder);
router.post("/webhook", validate(paymentWebhookSchema), paymentWebhook);

module.exports = router;
