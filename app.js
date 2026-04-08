const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const categoryRoutes = require("./src/routes/category.routes");
const bookRoutes = require("./src/routes/book.routes");
const reviewRoutes = require("./src/routes/review.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const adminRoutes = require("./src/routes/admin.routes");
const chatRoutes = require("./src/routes/chat.routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");

const app = express();

const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return ["http://localhost:5173", "http://localhost:3000"];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const isLocalOrigin = (origin = "") =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) || origin === "null";

const allowedOrigins = parseAllowedOrigins();
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (Postman, curl) or same-origin server calls.
      if (!origin) return callback(null, true);
      if (isLocalOrigin(origin)) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const shouldLogChatRequests = process.env.LOG_CHAT_REQUESTS === "true";
const isChatPollingEndpoint = (url = "") =>
  url.startsWith("/api/v1/chats/admin/conversations") || url.startsWith("/api/v1/chat/admin/conversations");

app.use(
  morgan("dev", {
    // Reduce noisy logs from polling/cached requests in development.
    skip: (req, res) => {
      if (!res.headersSent) return true;
      if (req.method === "OPTIONS") return true;
      if (res.statusCode === 304) return true;
      if (!shouldLogChatRequests && isChatPollingEndpoint(req.originalUrl)) return true;
      return false;
    },
  })
);

app.use((req, res, next) => {
  req.on("aborted", () => {
    const shouldLogAbortedChat = process.env.LOG_ABORTED_CHAT_REQUESTS === "true";
    const isChatEndpoint =
      req.originalUrl.startsWith("/api/v1/chats/") || req.originalUrl.startsWith("/api/v1/chat/");
    if (!isChatEndpoint || shouldLogAbortedChat) {
      // eslint-disable-next-line no-console
      console.warn(`[aborted] ${req.method} ${req.originalUrl}`);
    }
  });
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Book Store API is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/chat", chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
