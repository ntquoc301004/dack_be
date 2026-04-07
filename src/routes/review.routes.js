const express = require("express");
const { createReview } = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { reviewSchema } = require("../validators/review.validator");

const router = express.Router();

router.post("/", authMiddleware, validate(reviewSchema), createReview);

module.exports = router;
