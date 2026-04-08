const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const { createChatMessage } = require("./chat.service");

let ioInstance = null;

const roomOfUser = (userId) => `user:${String(userId)}`;
const ADMIN_ROOM = "admins";

const normalizeToken = (rawToken = "") => {
  if (!rawToken) return null;
  if (rawToken.startsWith("Bearer ")) return rawToken.slice(7);
  return rawToken;
};

const resolveReceiverId = (payload = {}) => {
  const candidates = [payload.toUserId, payload.receiverId, payload.userId, payload.to, payload.user, payload.receiver];
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

const parseAllowedSocketOrigins = () => {
  const raw = process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGINS;
  const configured = !raw
    ? ["http://localhost:5173", "http://localhost:3000"]
    : raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  // Allow common local frontend origins without extra env config.
  return [...configured, /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i];
};

const shouldLogSocket = process.env.LOG_SOCKET_EVENTS === "true";

const logSocket = (...args) => {
  if (!shouldLogSocket) return;
  // eslint-disable-next-line no-console
  console.log(...args);
};

const logSocketError = (...args) => {
  if (!shouldLogSocket) return;
  // eslint-disable-next-line no-console
  console.error(...args);
};

const initSocket = (httpServer) => {
  const allowedOrigins = parseAllowedSocketOrigins();
  const pingInterval = Number(process.env.SOCKET_PING_INTERVAL_MS) || 25000;
  const pingTimeout = Number(process.env.SOCKET_PING_TIMEOUT_MS) || 60000;
  const connectTimeout = Number(process.env.SOCKET_CONNECT_TIMEOUT_MS) || 20000;

  const io = require("socket.io")(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval,
    pingTimeout,
    connectTimeout,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;
      const token = normalizeToken(rawToken);
      if (!token) return next(new Error("Unauthorized: token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("Unauthorized: user not found"));

      socket.user = user;
      return next();
    } catch (error) {
      logSocketError("[socket] auth failed", error.message);
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    const userRoom = roomOfUser(user._id);
    socket.join(userRoom);
    if (user.role === "admin") {
      socket.join(ADMIN_ROOM);
    }
    logSocket(`[socket] connected userId=${user._id} role=${user.role}`);

    socket.on("chat:send", async (payload = {}, ack) => {
      try {
        const receiverId = resolveReceiverId(payload);
        const populated = await createChatMessage(user, {
          message: payload.message,
          toUserId: receiverId,
          receiverId: payload.receiverId,
          userId: payload.userId,
          to: payload.to,
        });

        if (user.role === "admin") {
          io.to(roomOfUser(receiverId)).emit("chat:message", populated);
          io.to(ADMIN_ROOM).emit("chat:message", populated);
        } else {
          io.to(ADMIN_ROOM).emit("chat:message", populated);
          io.to(userRoom).emit("chat:message", populated);
        }

        if (typeof ack === "function") ack({ success: true, data: { message: populated } });
      } catch (error) {
        if (typeof ack === "function") ack({ success: false, message: error.message });
      }
    });

    socket.on("chat:markRead", async (payload = {}, ack) => {
      try {
        const fromUserId = payload.fromUserId || null;
        if (user.role === "admin" && !fromUserId) {
          throw new Error("fromUserId is required for admin");
        }

        const query =
          user.role === "admin"
            ? { sender: fromUserId, receiverRole: "admin", isRead: false }
            : { senderRole: "admin", receiver: user._id, isRead: false };

        await ChatMessage.updateMany(query, { isRead: true, readAt: new Date() });
        if (typeof ack === "function") ack({ success: true, data: { updated: true } });
      } catch (error) {
        if (typeof ack === "function") ack({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", (reason) => {
      logSocket(`[socket] disconnected userId=${user._id} reason=${reason}`);
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => ioInstance;

module.exports = { initSocket, getIO, roomOfUser, ADMIN_ROOM };
