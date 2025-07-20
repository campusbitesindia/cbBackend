const mongoose = require("mongoose")

const PayoutRequestSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Request Details
    requestedAmount: {
      type: Number,
      required: true,
      min: 100, // Minimum payout amount
      max: 100000, // Maximum payout amount
    },
    availableBalance: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "rejected", "failed"],
      default: "pending",
    },

    // Admin Actions
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    adminNotes: { type: String },

    // Processing Details
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
    transactionId: { type: String }, // Bank transaction ID

    // Rejection/Failure Details
    rejectionReason: { type: String },
    failureReason: { type: String },

    // Bank Details at time of request (for audit)
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      upiId: String,
    },

    // Metadata
    requestNotes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Indexes
PayoutRequestSchema.index({ canteen: 1 })
PayoutRequestSchema.index({ vendor: 1 })
PayoutRequestSchema.index({ status: 1 })
PayoutRequestSchema.index({ createdAt: -1 })

module.exports = mongoose.model("PayoutRequest", PayoutRequestSchema)
 