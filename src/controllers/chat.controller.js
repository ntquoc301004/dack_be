const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const { getIO, roomOfUser, ADMIN_ROOM } = require("../services/socket.service");
const { createChatMessage } = require("../services/chat.service");

const parseLimit = (value, fallback = 200, max = 500) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
};

const resolveReceiverId = (body = {}) => {
  const candidates = [body.toUserId, body.receiverId, body.userId, body.to, body.user, body.receiver];
  for (const item of candidates) {
    if (!item) continue;
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      const id = item._id || item.id || item.userId;
      if (id) return id;
    }
  }
  return null;
};

const getMyMessages = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit, 200, 1000);
  const messages = await ChatMessage.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, data: { messages: messages.reverse() } });
});

const getAdminConversations = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit, 100, 500);
  const rows = await ChatMessage.aggregate([
    {
      $addFields: {
        userId: {
          $cond: [{ $eq: ["$senderRole", "user"] }, "$sender", "$receiver"],
        },
      },
    },
    { $match: { userId: { $ne: null } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        lastMessage: { $first: "$message" },
        lastMessageAt: { $first: "$createdAt" },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$senderRole", "user"] },
                  { $eq: ["$receiverRole", "admin"] },
                  { $eq: ["$isRead", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { lastMessageAt: -1 } },
    { $limit: limit },
  ]);

  const userIds = rows.map((r) => r._id);
  const users = await User.find({ _id: { $in: userIds } }).select("name email role").lean();
  const map = new Map(users.map((u) => [String(u._id), u]));

  const conversations = rows.map((row) => ({
    user: map.get(String(row._id)) || { _id: row._id },
    lastMessage: row.lastMessage,
    lastMessageAt: row.lastMessageAt,
    updatedAt: row.lastMessageAt,
    unreadCount: row.unreadCount || 0,
  }));

  res.json({ success: true, data: { conversations } });
});

const getAdminConversationByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const limit = parseLimit(req.query.limit, 300, 2000);
  const messages = await ChatMessage.find({
    $or: [
      { sender: userId, receiverRole: "admin" },
      { senderRole: "admin", receiver: userId },
    ],
  })
    .populate("sender", "name email role")
    .populate("receiver", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, data: { messages: messages.reverse() } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const toUserId = resolveReceiverId(req.body);
  const message = await createChatMessage(req.user, {
    message: req.body.message,
    toUserId,
    receiverId: req.body.receiverId,
    userId: req.body.userId,
    to: req.body.to,
  });

  const io = getIO();
  if (io) {
    if (req.user.role === "admin") {
      io.to(roomOfUser(toUserId)).emit("chat:message", message);
      io.to(ADMIN_ROOM).emit("chat:message", message);
    } else {
      io.to(ADMIN_ROOM).emit("chat:message", message);
      io.to(roomOfUser(req.user._id)).emit("chat:message", message);
    }
  }

  res.status(201).json({ success: true, data: { message } });
});

const deleteConversation = asyncHandler(async (req, res) => {
  const targetUserId = resolveReceiverId(req.body);

  if (req.user.role === "admin") {
    if (!targetUserId) {
      res.status(400);
      throw new Error("Admin must provide userId/toUserId to delete conversation");
    }

    const result = await ChatMessage.deleteMany({
      $or: [
        { sender: targetUserId, receiverRole: "admin" },
        { senderRole: "admin", receiver: targetUserId },
      ],
    });

    return res.json({
      success: true,
      data: { deletedCount: result.deletedCount, userId: targetUserId },
    });
  }

  // User deletes only their own conversation with admin.
  const result = await ChatMessage.deleteMany({
    $or: [{ sender: req.user._id, receiverRole: "admin" }, { senderRole: "admin", receiver: req.user._id }],
  });

  return res.json({
    success: true,
    data: { deletedCount: result.deletedCount, userId: String(req.user._id) },
  });
});

module.exports = {
  getMyMessages,
  getAdminConversations,
  getAdminConversationByUser,
  sendMessage,
  deleteConversation,
};
