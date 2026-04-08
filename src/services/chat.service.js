const ChatMessage = require("../models/ChatMessage");
const mongoose = require("mongoose");

const DUPLICATE_WINDOW_MS = 3000;

const extractId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value._id || value.id || value.userId || null;
  }
  return null;
};

const pickReceiverId = (payload = {}) =>
  extractId(payload.toUserId) ||
  extractId(payload.receiverId) ||
  extractId(payload.userId) ||
  extractId(payload.to) ||
  extractId(payload.user) ||
  extractId(payload.receiver) ||
  null;

const buildMessagePayload = (senderUser, { message, toUserId, receiverId, userId, to }) => {
  const text = String(message || "").trim();
  if (!text) {
    const err = new Error("Message is required");
    err.statusCode = 400;
    throw err;
  }

  const resolvedReceiverId = pickReceiverId({ toUserId, receiverId, userId, to });

  if (senderUser.role === "admin" && !resolvedReceiverId) {
    const err = new Error("Admin must provide toUserId");
    err.statusCode = 400;
    throw err;
  }
  if (resolvedReceiverId && !mongoose.Types.ObjectId.isValid(String(resolvedReceiverId))) {
    const err = new Error("Invalid toUserId");
    err.statusCode = 400;
    throw err;
  }

  return {
    sender: senderUser._id,
    senderRole: senderUser.role,
    receiver: senderUser.role === "admin" ? resolvedReceiverId : null,
    receiverRole: senderUser.role === "admin" ? "user" : "admin",
    message: text,
  };
};

const findRecentDuplicate = async (payload) => {
  const threshold = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const duplicate = await ChatMessage.findOne({
    sender: payload.sender,
    receiver: payload.receiver,
    senderRole: payload.senderRole,
    receiverRole: payload.receiverRole,
    message: payload.message,
    createdAt: { $gte: threshold },
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .lean();

  return duplicate || null;
};

const createChatMessage = async (senderUser, payload) => {
  const data = buildMessagePayload(senderUser, payload);

  const duplicate = await findRecentDuplicate(data);
  if (duplicate) {
    return duplicate;
  }

  const created = await ChatMessage.create(data);
  const full = await ChatMessage.findById(created._id)
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .lean();
  return full;
};

module.exports = { createChatMessage };
