const Payment = require("../models/Payment");
const Order = require("../models/Order");
const asyncHandler = require("../middlewares/asyncHandler");

const syncOrderStatusByPayment = async (order, paymentStatus) => {
  if (paymentStatus === "paid") {
    order.status = "shipping";
  } else if (paymentStatus === "failed" || paymentStatus === "refunded") {
    order.status = "cancelled";
  } else if (paymentStatus === "pending" && order.status === "cancelled") {
    order.status = "pending";
  }
  await order.save();
};

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("order")
    .sort({ createdAt: -1 });
  res.json({ payments });
});

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    order: req.params.orderId,
    user: req.user._id,
  }).populate("order");

  if (!payment) {
    res.status(404);
    throw new Error("Payment not found for this order");
  }

  res.json({ payment });
});

const paymentWebhook = asyncHandler(async (req, res) => {
  const { orderId, status, transactionId, failureReason, metadata } = req.body;

  const payment = await Payment.findOne({ order: orderId });
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status === "paid") {
    await payment.markPaid(transactionId || "");
  } else if (status === "failed") {
    await payment.markFailed(failureReason || "Payment failed");
  } else {
    payment.status = status;
    payment.transactionId = transactionId || payment.transactionId;
    payment.metadata = metadata || payment.metadata;
    if (failureReason) payment.failureReason = failureReason;
    await payment.save();
  }

  if (metadata && typeof metadata === "object") {
    payment.metadata = { ...payment.metadata, ...metadata };
    await payment.save();
  }

  await syncOrderStatusByPayment(order, payment.status);

  res.json({
    message: "Payment updated",
    payment,
    order,
  });
});

module.exports = { getMyPayments, getPaymentByOrder, paymentWebhook };
