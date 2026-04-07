const express = require("express");
const { getUsers, deleteUser } = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getUsers);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
