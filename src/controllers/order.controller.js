const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const Payment = require("../models/Payment");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

const normalizePaymentMethod = (method) => {
  const normalized = (method || "").toLowerCase().trim();
  if (normalized === "cash" || normalized === "cash_on_delivery") return "cod";
  return normalized;
};

const normalizeNullableText = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
};

const buildShippingFromProfile = (user) => {
  const shippingInfo = {
    fullName: normalizeNullableText(user.name),
    phone: normalizeNullableText(user.phone),
    city: normalizeNullableText(user.city),
    district: normalizeNullableText(user.district),
    ward: normalizeNullableText(user.ward),
    streetAddress: normalizeNullableText(user.streetAddress),
  };

  const composedAddress = [shippingInfo.streetAddress, shippingInfo.ward, shippingInfo.district, shippingInfo.city]
    .filter(Boolean)
    .join(", ");

  return { shippingInfo, composedAddress };
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
  const insufficientItems = [];

  for (const item of cart.items) {
    const book = await Book.findById(item.book._id);
    if (!book) {
      res.status(404);
      throw new AppError(`Book not found: ${item.book._id}`, 404);
    }
    if (book.stock < item.quantity) {
      insufficientItems.push({
        bookId: String(book._id),
        title: book.title,
        requested: item.quantity,
        inStock: book.stock,
      });
    }
  }

  if (insufficientItems.length > 0) {
    throw new AppError(
      "Không đủ hàng trong kho so với số lượng trong giỏ. Vui lòng giảm số lượng hoặc xóa sản phẩm.",
      400,
      { insufficientItems }
    );
  }

  for (const item of cart.items) {
    const book = await Book.findById(item.book._id);

    book.stock -= item.quantity;
    await book.save();

    orderItems.push({
      book: book._id,
      quantity: item.quantity,
      price: book.price,
    });
    totalPrice += item.quantity * book.price;
  }

  const providedAddress = normalizeNullableText(shippingAddress);
  const { shippingInfo, composedAddress } = buildShippingFromProfile(req.user);
  const finalShippingAddress = providedAddress || composedAddress;

  if (!finalShippingAddress || finalShippingAddress.length < 5) {
    throw new AppError(
      "Thiếu địa chỉ giao hàng. Vui lòng cập nhật thông tin cá nhân hoặc nhập shippingAddress khi thanh toán.",
      400
    );
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    totalPrice,
    shippingAddress: finalShippingAddress,
    shippingInfo,
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
