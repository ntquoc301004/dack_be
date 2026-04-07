const Review = require("../models/Review");
const Book = require("../models/Book");
const asyncHandler = require("../middlewares/asyncHandler");

const createReview = asyncHandler(async (req, res) => {
  const { bookId, rating, comment } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { rating, comment, user: req.user._id, book: bookId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ message: "Review saved", review });
});

module.exports = { createReview };
