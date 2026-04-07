const express = require("express");
const { register, login, profile } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", authMiddleware, profile);

module.exports = router;
