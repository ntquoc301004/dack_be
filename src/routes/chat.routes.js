const express = require("express");
const {
  getMyMessages,
  getAdminConversations,
  getAdminConversationByUser,
  sendMessage,
  deleteConversation,
} = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();
const shouldLogChatRequests = process.env.LOG_CHAT_REQUESTS === "true";

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

router.use(authMiddleware);

router.use((req, res, next) => {
  if (!shouldLogChatRequests) return next();
  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    // eslint-disable-next-line no-console
    console.log(`[chat] ${req.method} ${req.originalUrl} userId=${req.user?._id || "unknown"} ${durationMs}ms`);
  });
  next();
});

router.post("/send", sendMessage);
router.post("/delete", deleteConversation);
router.get("/my", getMyMessages);
router.get("/admin/conversations", adminMiddleware, getAdminConversations);
router.get("/admin/conversations/:userId", adminMiddleware, getAdminConversationByUser);

module.exports = router;
