const Cart = require("../models/Cart");
const Book = require("../models/Book");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.book");
  res.json({ cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  const cart = await getOrCreateCart(req.user._id);
  const index = cart.items.findIndex((item) => item.book.toString() === bookId);

  let newQuantity = quantity;
  if (index > -1) {
    newQuantity = cart.items[index].quantity + quantity;
  }

  if (newQuantity > book.stock) {
    throw new AppError(
      "Số lượng trong giỏ vượt quá tồn kho.",
      400,
      {
        bookId: String(book._id),
        title: book.title,
        requested: newQuantity,
        inStock: book.stock,
      }
    );
  }

  if (index > -1) {
    cart.items[index].quantity = newQuantity;
  } else {
    cart.items.push({ book: bookId, quantity });
  }

  await cart.save();
  await cart.populate("items.book");
  res.json({ message: "Added to cart", cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const index = cart.items.findIndex((item) => item.book.toString() === bookId);

  if (index === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }
  if (quantity > book.stock) {
    throw new AppError(
      "Số lượng vượt quá tồn kho.",
      400,
      {
        bookId: String(book._id),
        title: book.title,
        requested: quantity,
        inStock: book.stock,
      }
    );
  }

  cart.items[index].quantity = quantity;
  await cart.save();
  await cart.populate("items.book");
  res.json({ message: "Cart item updated", cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const cart = await getOrCreateCart(req.user._id);

  cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
  await cart.save();
  await cart.populate("items.book");

  res.json({ message: "Item removed from cart", cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
