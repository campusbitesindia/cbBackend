const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "attempted", "paid", "failed", "cancelled", "refunded"],
      default: "created",
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "COD"],
      default: "upi",
    },
    failureReason: {
      type: String,
      default: null,
    },
    // Refund related fields (only one refund allowed - full amount)
    refund: {
      refundId: {
        type: String,
        default: null,
      },
      reason: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: ["pending", "processed", "failed"],
        default: null,
      },
      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      initiatedAt: {
        type: Date,
        default: null,
      },
      processedAt: {
        type: Date,
        default: null,
      },
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Consolidated indexes for better performance - avoid duplicates
transactionSchema.index({ orderId: 1 })
transactionSchema.index({ userId: 1 })
transactionSchema.index({ razorpayOrderId: 1 })
transactionSchema.index({ razorpayPaymentId: 1 })
transactionSchema.index({ status: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ "refund.refundId": 1 })

// Method to check if transaction is successful
transactionSchema.methods.isSuccessful = function () {
  return this.status === "paid"
}

// Method to check if transaction can be refunded
transactionSchema.methods.canRefund = function () {
  return this.status === "paid" && !this.refund.refundId
}

// Method to check if transaction is refunded
transactionSchema.methods.isRefunded = function () {
  return this.status === "refunded"
}

// Method to initiate refund
transactionSchema.methods.initiateRefund = function (reason, initiatedBy) {
  this.refund = {
    reason: reason,
    status: "pending",
    initiatedBy: initiatedBy,
    initiatedAt: new Date(),
  }
}

// Method to complete refund
transactionSchema.methods.completeRefund = function (refundId) {
  this.refund.refundId = refundId
  this.refund.status = "processed"
  this.refund.processedAt = new Date()
  this.status = "refunded"
  this.refundedAt = new Date()
}

// Method to fail refund
transactionSchema.methods.failRefund = function () {
  this.refund.status = "failed"
  // Reset refund data on failure
  this.refund = {
    refundId: null,
    reason: null,
    status: null,
    initiatedBy: null,
    initiatedAt: null,
    processedAt: null,
  }
}

module.exports = mongoose.model("Transaction", transactionSchema)
