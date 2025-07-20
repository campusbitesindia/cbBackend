const mongoose = require("mongoose")

const BankDetailsSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Bank Account Details
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    accountNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^\d{9,18}$/.test(v)
        },
        message: "Account number must be 9-18 digits",
      },
    },
    confirmAccountNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v === this.accountNumber
        },
        message: "Account numbers do not match",
      },
    },
    ifscCode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v)
        },
        message: "Invalid IFSC code format",
      },
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // UPI Details (Optional)
    upiId: {
      type: String,
      validate: {
        validator: (v) => {
          if (!v) return true
          return /^[\w.-]+@[\w.-]+$/.test(v)
        },
        message: "Invalid UPI ID format",
      },
    },

    // Verification Status
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    verificationNotes: { type: String },

    // Status
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// Consolidated indexes - avoid duplicates
BankDetailsSchema.index({ canteen: 1 }) // This might conflict with unique: true above
BankDetailsSchema.index({ owner: 1 })
BankDetailsSchema.index({ accountNumber: 1 })
BankDetailsSchema.index({ ifscCode: 1 })
BankDetailsSchema.index({ isVerified: 1 })
BankDetailsSchema.index({ isDeleted: 1 })

module.exports = mongoose.model("BankDetails", BankDetailsSchema)
