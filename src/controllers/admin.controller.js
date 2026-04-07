const User = require("../models/User");
const Book = require("../models/Book");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Payment = require("../models/Payment");
const Author = require("../models/Author");
const asyncHandler = require("../middlewares/asyncHandler");

const parsePage = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const getDashboardStats = asyncHandler(async (req, res) => {
  const [users, books, categories, orders, reviews] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Review.countDocuments(),
  ]);

  const paymentAgg = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const paymentSummary = {
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    refunded: { count: 0, amount: 0 },
  };

  paymentAgg.forEach((item) => {
    paymentSummary[item._id] = {
      count: item.count,
      amount: Number(item.amount.toFixed(2)),
    };
  });

  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    overview: { users, books, categories, orders, reviews },
    paymentSummary,
    recentOrders,
  });
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const page = parsePage(req.query.page, 1);
  const limit = parsePage(req.query.limit, 20);
  const status = (req.query.status || "").trim();

  const query = status ? { status } : {};
  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("orderItems.book")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.json({
    message: "User role updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const getAdminReviews = asyncHandler(async (req, res) => {
  const page = parsePage(req.query.page, 1);
  const limit = parsePage(req.query.limit, 20);
  const total = await Review.countDocuments();

  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("book", "title")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  await review.deleteOne();
  res.json({ message: "Review deleted" });
});

const getAuthors = asyncHandler(async (req, res) => {
  const authors = await Author.find().sort({ createdAt: -1 });
  res.json({ authors });
});

const createAuthor = asyncHandler(async (req, res) => {
  const author = await Author.create(req.body);
  res.status(201).json({ message: "Author created", author });
});

const updateAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }

  res.json({ message: "Author updated", author });
});

const deleteAuthor = asyncHandler(async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author) {
    res.status(404);
    throw new Error("Author not found");
  }
  await author.deleteOne();
  res.json({ message: "Author deleted" });
});

const getAdminPayments = asyncHandler(async (req, res) => {
  const page = parsePage(req.query.page, 1);
  const limit = parsePage(req.query.limit, 20);
  const status = (req.query.status || "").trim();
  const method = (req.query.method || "").trim();

  const query = {};
  if (status) query.status = status;
  if (method) query.method = method;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate("user", "name email")
    .populate("order")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const updatePaymentStatusByAdmin = asyncHandler(async (req, res) => {
  const { status, transactionId, failureReason } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }

  if (status === "paid") {
    await payment.markPaid(transactionId || payment.transactionId);
  } else if (status === "failed") {
    await payment.markFailed(failureReason || "Payment failed");
  } else {
    payment.status = status;
    if (transactionId !== undefined) payment.transactionId = transactionId;
    if (failureReason !== undefined) payment.failureReason = failureReason;
    await payment.save();
  }

  const order = await Order.findById(payment.order);
  if (order) {
    if (payment.status === "paid") order.status = "shipping";
    if (payment.status === "failed" || payment.status === "refunded") order.status = "cancelled";
    await order.save();
  }

  res.json({ message: "Payment status updated", payment, order });
});

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateUserRole,
  getAdminReviews,
  deleteReviewByAdmin,
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAdminPayments,
  updatePaymentStatusByAdmin,
};
