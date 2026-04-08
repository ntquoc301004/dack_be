const express = require("express");
const {
  getMe,
  updateMe,
  changeMyPassword,
  uploadMyAvatar,
  getUsers,
  deleteUser,
} = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const uploadAvatar = require("../middlewares/uploadAvatar");
const { updateProfileSchema, changePasswordSchema } = require("../validators/user.validator");

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, validate(updateProfileSchema), updateMe);
router.put("/me", authMiddleware, validate(updateProfileSchema), updateMe);
router.put("/me/password", authMiddleware, validate(changePasswordSchema), changeMyPassword);
router.put("/me/avatar", authMiddleware, uploadAvatar.single("avatar"), uploadMyAvatar);
router.get("/", authMiddleware, adminMiddleware, getUsers);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
