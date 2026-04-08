class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
