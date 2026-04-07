const Category = require("../models/Category");
const asyncHandler = require("../middlewares/asyncHandler");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ message: "Category created", category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ message: "Category updated", category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted" });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
