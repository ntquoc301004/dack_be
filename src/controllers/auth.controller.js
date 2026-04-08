const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const { generateToken } = require("../services/token.service");
const { sendResetPasswordEmail } = require("../services/mail.service");

const RESET_TOKEN_MS = Number(process.env.PASSWORD_RESET_EXPIRES_MS) || 60 * 60 * 1000;

const buildForgotPasswordResponse = (plainToken) => {
  const payload = {
    message: "If this email is registered, you can reset your password using the token.",
  };
  if (process.env.EXPOSE_RESET_TOKEN_IN_RESPONSE === "true" && plainToken) {
    payload.resetToken = plainToken;
    payload.resetTokenExpiresInMs = RESET_TOKEN_MS;
  }
  return payload;
};

const hashResetToken = (plainToken) => crypto.createHash("sha256").update(plainToken).digest("hex");

const generateUniqueUsername = async (email) => {
  const base = (email || "user")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24) || "user";

  for (let i = 0; i < 10; i += 1) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  return `user${Date.now()}`;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = await generateUniqueUsername(email);
  const user = await User.create({ name, email, username, password: hashedPassword });

  const token = generateToken(user._id);
  res.status(201).json({
    message: "Register successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);
  res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const profile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json(buildForgotPasswordResponse());
  }

  const plainToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashResetToken(plainToken);
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_MS);
  await user.save({ validateBeforeSave: false });

  const frontendResetBaseUrl = process.env.FRONTEND_RESET_PASSWORD_URL || "http://localhost:5173/reset-password";
  const resetUrl = `${frontendResetBaseUrl}?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(
    plainToken
  )}`;
  const expiresMinutes = Math.ceil(RESET_TOKEN_MS / (60 * 1000));

  try {
    await sendResetPasswordEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresMinutes,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Cannot send reset password email now. Please try again later.");
  }

  res.json(buildForgotPasswordResponse(plainToken));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  const tokenHash = hashResetToken(token);

  let user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  // Backward compatibility for old bcrypt-hashed reset tokens.
  if (!user && email) {
    const legacyUser = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
    if (legacyUser && legacyUser.passwordResetToken && legacyUser.passwordResetExpires) {
      if (legacyUser.passwordResetExpires.getTime() < Date.now()) {
        legacyUser.passwordResetToken = undefined;
        legacyUser.passwordResetExpires = undefined;
        await legacyUser.save({ validateBeforeSave: false });
        res.status(400);
        throw new Error("Reset token has expired");
      }
      const isLegacyMatch = await bcrypt.compare(token, legacyUser.passwordResetToken);
      if (isLegacyMatch) {
        user = legacyUser;
      }
    }
  }

  if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
    res.status(400);
    throw new Error("Invalid or expired reset request");
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
});

module.exports = { register, login, profile, forgotPassword, resetPassword };
