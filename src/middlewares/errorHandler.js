const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  const statusFromErr = typeof err.statusCode === "number" ? err.statusCode : null;
  const statusFromRes = res.statusCode && res.statusCode !== 200 ? res.statusCode : null;
  const statusCode = statusFromErr || statusFromRes || 500;
  const message = err.message || "Internal Server Error";

  const payload = { success: false, message };
  if (err.details !== undefined) {
    payload.details = err.details;
  }
  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFoundHandler, errorHandler };
