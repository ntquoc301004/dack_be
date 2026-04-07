const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }
  return next();
};

module.exports = adminMiddleware;
