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

    // Required Business details for approval
    adhaarNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^\d{12}$/.test(v) // 12 digit validation
        },
        message: "Adhaar number must be 12 digits",
      },
    },
    panNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) // PAN format validation
        },
        message: "Invalid PAN number format",
      },
    },
    gstNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) // GST format validation
        },
        message: "Invalid GST number format",
      },
    },
    contactPersonName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    contactPhone: { type: String },
    description: { type: String },
    operatingHours: {
      open: { type: String },
      close: { type: String },
    },

    // Financial tracking
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Index for faster queries
CanteenSchema.index({ adhaarNumber: 1 })
CanteenSchema.index({ panNumber: 1 })
CanteenSchema.index({ gstNumber: 1 })
CanteenSchema.index({ owner: 1 })

module.exports = mongoose.model("Canteen", CanteenSchema)
