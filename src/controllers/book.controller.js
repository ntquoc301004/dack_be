const Book = require("../models/Book");
const Review = require("../models/Review");
const asyncHandler = require("../middlewares/asyncHandler");

const getBooks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const keyword = req.query.keyword ? req.query.keyword.trim() : "";

  const query = keyword
    ? {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { author: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .populate("category")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate("category");
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.json({ book });
});

const createBook = asyncHandler(async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ message: "Book created", book });
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  res.json({ message: "Book updated", book });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  await book.deleteOne();
  res.json({ message: "Book deleted" });
});

const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.id }).populate("user", "name email");
  res.json({ reviews });
});

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook, getBookReviews };
