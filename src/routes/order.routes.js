const express = require("express");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const { createOrderSchema, updateOrderStatusSchema } = require("../validators/order.validator");

const router = express.Router();

router.post("/", authMiddleware, validate(createOrderSchema), createOrder);
router.get("/my", authMiddleware, getMyOrders);
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
