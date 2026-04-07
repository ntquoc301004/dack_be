const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["cod", "bank_transfer", "momo", "vnpay", "paypal", "stripe"],
      required: true,
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, method: 1 });

paymentSchema.pre("save", function syncPaymentDates(next) {
  if (this.status === "paid" && !this.paidAt) {
    this.paidAt = new Date();
  }
  if (this.status !== "failed" && this.failureReason) {
    this.failureReason = "";
  }
  next();
});

paymentSchema.methods.markPaid = function markPaid(transactionId = "") {
  this.status = "paid";
  this.transactionId = transactionId;
  this.paidAt = new Date();
  return this.save();
};

paymentSchema.methods.markFailed = function markFailed(reason = "") {
  this.status = "failed";
  this.failureReason = reason || "Payment failed";
  return this.save();
};

module.exports = mongoose.model("Payment", paymentSchema);
