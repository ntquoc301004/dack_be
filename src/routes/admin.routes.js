const express = require("express");
const {
  getDashboardStats,
  getAdminOrders,
  updateUserRole,
  getAdminReviews,
  deleteReviewByAdmin,
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAdminPayments,
  updatePaymentStatusByAdmin,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const validate = require("../middlewares/validate");
const {
  updateUserRoleSchema,
  authorSchema,
  updatePaymentStatusSchema,
} = require("../validators/admin.validator");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboardStats);

router.get("/orders", getAdminOrders);

router.put("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);

router.get("/reviews", getAdminReviews);
router.delete("/reviews/:id", deleteReviewByAdmin);

router.get("/authors", getAuthors);
router.post("/authors", validate(authorSchema), createAuthor);
router.put("/authors/:id", validate(authorSchema), updateAuthor);
router.delete("/authors/:id", deleteAuthor);

router.get("/payments", getAdminPayments);
router.put("/payments/:id/status", validate(updatePaymentStatusSchema), updatePaymentStatusByAdmin);

module.exports = router;
