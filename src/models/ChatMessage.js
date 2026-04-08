const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    receiverRole: {
      type: String,
      enum: ["user", "admin", null],
      default: null,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ sender: 1, createdAt: -1 });
chatMessageSchema.index({ receiver: 1, createdAt: -1 });
chatMessageSchema.index({ senderRole: 1, receiverRole: 1, isRead: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
