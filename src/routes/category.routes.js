const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const { categorySchema } = require("../validators/category.validator");

const router = express.Router();

router.get("/", getCategories);
router.post("/", authMiddleware, adminMiddleware, validate(categorySchema), createCategory);
router.put("/:id", authMiddleware, adminMiddleware, validate(categorySchema), updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
