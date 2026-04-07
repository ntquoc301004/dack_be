const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const Payment = require("../models/Payment");
const asyncHandler = require("../middlewares/asyncHandler");

const normalizePaymentMethod = (method) => {
  const normalized = (method || "").toLowerCase().trim();
  if (normalized === "cash" || normalized === "cash_on_delivery") return "cod";
  return normalized;
};

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const orderItems = [];
  let totalPrice = 0;

  for (const item of cart.items) {
    const book = await Book.findById(item.book._id);
    if (!book) {
      res.status(404);
      throw new Error(`Book not found: ${item.book._id}`);
    }
    if (book.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for book: ${book.title}`);
    }

    book.stock -= item.quantity;
    await book.save();

    orderItems.push({
      book: book._id,
      quantity: item.quantity,
      price: book.price,
    });
    totalPrice += item.quantity * book.price;
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    totalPrice,
    shippingAddress,
    paymentMethod: normalizePaymentMethod(paymentMethod),
  });

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    method: normalizePaymentMethod(paymentMethod),
    amount: totalPrice,
    status: "pending",
    metadata: {
      source: "order_create",
    },
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ message: "Order created", order, payment });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("orderItems.book");
  res.json({ orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").populate("orderItems.book");
  res.json({ orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();
  res.json({ message: "Order status updated", order });
});

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
