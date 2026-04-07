const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const categoryRoutes = require("./src/routes/category.routes");
const bookRoutes = require("./src/routes/book.routes");
const reviewRoutes = require("./src/routes/review.routes");
const cartRoutes = require("./src/routes/cart.routes");
const orderRoutes = require("./src/routes/order.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const adminRoutes = require("./src/routes/admin.routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan("dev", {
    // Skip unfinished/aborted requests to avoid "- - ms - -" noise.
    skip: (req, res) => !res.headersSent,
  })
);

app.use((req, res, next) => {
  req.on("aborted", () => {
    // eslint-disable-next-line no-console
    console.warn(`[aborted] ${req.method} ${req.originalUrl}`);
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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
