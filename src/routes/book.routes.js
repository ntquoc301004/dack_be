const express = require("express");
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookReviews,
} = require("../controllers/book.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const { bookSchema } = require("../validators/book.validator");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authMiddleware, adminMiddleware, validate(bookSchema), createBook);
router.put("/:id", authMiddleware, adminMiddleware, validate(bookSchema), updateBook);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBook);
router.get("/:id/reviews", getBookReviews);

module.exports = router;
