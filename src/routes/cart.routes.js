const express = require("express");
const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { addToCartSchema, updateCartSchema, removeFromCartSchema } = require("../validators/cart.validator");

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, validate(addToCartSchema), addToCart);
router.put("/update", authMiddleware, validate(updateCartSchema), updateCartItem);
router.delete("/remove", authMiddleware, validate(removeFromCartSchema), removeCartItem);

module.exports = router;
