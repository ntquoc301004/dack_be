const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // Snapshot price when customer checks out.
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderItemSchema.index({ book: 1, createdAt: -1 });

orderItemSchema.virtual("lineTotal").get(function lineTotal() {
  return Number((this.quantity * this.priceAtPurchase).toFixed(2));
});

orderItemSchema.methods.updateQuantity = function updateQuantity(quantity) {
  this.quantity = quantity;
  return this.save();
};

module.exports = mongoose.model("OrderItem", orderItemSchema);
