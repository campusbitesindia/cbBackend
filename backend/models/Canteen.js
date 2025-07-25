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
    isOpen: { type: Boolean, default: false },
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
          return /^\d{12}$/.test(v)
        },
        message: "Adhaar number must be 12 digits",
      },
    },
    panNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v)
        },
        message: "Invalid PAN number format",
      },
    },
    gstNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v)
        },
        message: "Invalid GST number format",
      },
    },
    fssaiLicense: {
      type: String,
      validate: {
        validator: (v) => {
          if (!v) return true
          return /^[0-9]{14}$/.test(v)
        },
        message: "FSSAI license must be 14 digits",
      },
    },
    contactPersonName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    // New fields from the vendor onboarding form
    mobile: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^\d{10}$/.test(v)
        },
        message: "Mobile number must be 10 digits",
      },
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: "Invalid email format",
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    contactPhone: { type: String }, // Keep for backward compatibility
    description: { type: String },

    // Updated operating hours structure
    operatingHours: {
      opening: {
        type: String,
        required: true,
        validate: {
          validator: (v) => {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
          },
          message: "Opening time must be in HH:MM format",
        },
      },
      closing: {
        type: String,
        required: true,
        validate: {
          validator: (v) => {
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
          },
          message: "Closing time must be in HH:MM format",
        },
      },
    },

    // Operating days
    operatingDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },

    // Financial tracking
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Consolidated index definitions - only define each index once
CanteenSchema.index({ campus: 1 })
CanteenSchema.index({ owner: 1 })
CanteenSchema.index({ adhaarNumber: 1 })
CanteenSchema.index({ panNumber: 1 })
CanteenSchema.index({ gstNumber: 1 })
CanteenSchema.index({ fssaiLicense: 1 })
CanteenSchema.index({ mobile: 1 })
CanteenSchema.index({ email: 1 })
CanteenSchema.index({ approvalStatus: 1 })
CanteenSchema.index({ isDeleted: 1, isApproved: 1 })

module.exports = mongoose.model("Canteen", CanteenSchema)
