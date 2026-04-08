const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, email, phone, city, district, ward, streetAddress } = req.body;
  const userId = req.user._id;

  if (email) {
    const taken = await User.findOne({ email, _id: { $ne: userId } });
    if (taken) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  const payload = {};
  if (name !== undefined) payload.name = name;
  if (email !== undefined) payload.email = email;
  if (phone !== undefined) payload.phone = phone || null;
  if (city !== undefined) payload.city = city || null;
  if (district !== undefined) payload.district = district || null;
  if (ward !== undefined) payload.ward = ward || null;
  if (streetAddress !== undefined) payload.streetAddress = streetAddress || null;

  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ message: "Profile updated", user });
});

const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  if (newPassword === currentPassword) {
    res.status(400);
    throw new Error("New password must be different from current password");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
});

const uploadMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Avatar file is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Delete old local avatar if exists.
  if (user.avatar && user.avatar.includes("/uploads/profile/")) {
    const oldFileName = user.avatar.split("/uploads/profile/")[1];
    if (oldFileName) {
      const oldPath = path.join(process.cwd(), "uploads", "profile", oldFileName);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
  }

  const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/profile/${req.file.filename}`;
  user.avatar = avatarUrl;
  await user.save();

  const safeUser = await User.findById(req.user._id).select("-password");
  res.json({
    message: "Avatar uploaded successfully",
    avatar: avatarUrl,
    user: safeUser,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ message: "User deleted successfully" });
});

module.exports = { getMe, updateMe, changeMyPassword, uploadMyAvatar, getUsers, deleteUser };
