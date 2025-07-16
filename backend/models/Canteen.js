const mongoose = require("mongoose")

const adminRatingSchema = new mongoose.Schema({
  rating: Number,
  feedback: String,
  date: { type: Date, default: Date.now },
})

const CanteenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isOpen: { type: Boolean, default: false }, // Default to false until approved
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    images: [{ type: String }],
    adminRatings: [adminRatingSchema],
    isDeleted: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },

    // Approval system
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    // Business details for approval
    
    contactPhone: { type: String },
    description: { type: String },
    operatingHours: {
      open: { type: String },
      close: { type: String },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Canteen", CanteenSchema)
