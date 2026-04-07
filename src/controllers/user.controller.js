const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");

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

module.exports = { getUsers, deleteUser };
