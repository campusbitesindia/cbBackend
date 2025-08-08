const crypto = require("crypto")
const Transaction = require("../models/Transaction")
const Order = require("../models/Order")
const Notification = require("../models/Notification")

// Razorpay webhook handler
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers["x-razorpay-signature"]
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSignature || !webhookSecret) { 
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature or secret",
      })
    }

    const body = JSON.stringify(req.body)
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

    if (webhookSignature !== expectedSignature) {
      console.error("Webhook signature verification failed")
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      })
    }

    const { event, payload } = req.body

    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity)
        break

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity)
        break

      case "refund.processed":
        await handleRefundProcessed(payload.refund.entity)
        break

      case "refund.failed":
        await handleRefundFailed(payload.refund.entity)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    })
  }
}

// Handle payment captured event
const handlePaymentCaptured = async (payment) => {
  try {
    const transaction = await Transaction.findOne({
      razorpayOrderId: payment.order_id,
    }).populate("orderId userId")

    if (!transaction) {
      console.error(`Transaction not found for order ID: ${payment.order_id}`)
      return
    }

    // Update transaction if not already updated
    if (transaction.status !== "paid") {
      transaction.razorpayPaymentId = payment.id
      transaction.status = "paid"
      transaction.paymentMethod = "upi"
      transaction.paidAt = new Date(payment.created_at * 1000)
      await transaction.save()

      // Update order
      const order = transaction.orderId
      order.status = "placed"
      order.paymentStatus = "paid"
      order.paidAt = new Date(payment.created_at * 1000)
      await order.save()

      // Create notification for user
      await createNotification(
        transaction.userId._id,
        "UPI Payment Successful",
        `Your UPI payment of ₹${transaction.amount} has been processed successfully.`,
        "payment_success",
      )

    }
  } catch (error) {
    console.error("Handle payment captured error:", error)
  }
}

// Handle payment failed event
const handlePaymentFailed = async (payment) => {
  try {
    const transaction = await Transaction.findOne({
      razorpayOrderId: payment.order_id,
    }).populate("orderId userId")
    if (!transaction) {
      console.error(`Transaction not found for order ID: ${payment.order_id}`)
      return
    }

    // Update transaction
    transaction.razorpayPaymentId = payment.id
    transaction.status = "failed"
    transaction.failureReason = payment.error_description || "UPI payment failed"
    await transaction.save()

    // Update order
    const orderid = transaction.orderId._id
    const order=await Order.findOne({_id:orderid});
    order.status = "pending"
    order.paymentStatus = "failed"
    await order.save()

    // Create notification for user
    await createNotification(
      transaction.userId._id,
      "UPI Payment Failed",
      `Your UPI payment of ₹${transaction.amount} has failed. Please try again.`,
      "payment_failed",
    )

  } catch (error) {
    console.error("Handle payment failed error:", error)
  }
}

// Handle full refund processed event
const handleRefundProcessed = async (refund) => {
  try {
    const transaction = await Transaction.findOne({
      razorpayPaymentId: refund.payment_id,
    }).populate("orderId userId")

    if (!transaction) {
      console.error(`Transaction not found for payment ID: ${refund.payment_id}`)
      return
    }

    // Check if this is the correct refund
    if (transaction.refund.refundId === refund.id) {
      // Complete the refund
      transaction.completeRefund(refund.id)
      await transaction.save()

      // Update order status to refunded
      const order = transaction.orderId
      order.status = "refunded"
      await order.save()

      // Create notification for user
      await createNotification(
        transaction.userId._id,
        "Full Refund Processed",
        `Your full refund of ₹${transaction.amount} has been processed successfully and will be credited to your account within 5-7 business days.`,
        "refund_processed",
      )

    }
  } catch (error) {
    console.error("Handle refund processed error:", error)
  }
}

// Handle refund failed event
const handleRefundFailed = async (refund) => {
  try {
    const transaction = await Transaction.findOne({
      razorpayPaymentId: refund.payment_id,
    }).populate("orderId userId")

    if (!transaction) {
      console.error(`Transaction not found for payment ID: ${refund.payment_id}`)
      return
    }

    // Check if this is the correct refund
    if (transaction.refund.refundId === refund.id) {
      // Fail the refund
      transaction.failRefund()
      await transaction.save()

      // Create notification for user
      await createNotification(
        transaction.userId._id,
        "Refund Failed",
        `Your refund request of ₹${transaction.amount} has failed. Please contact support for assistance.`,
        "refund_failed",
      )

    }
  } catch (error) {
    console.error("Handle refund failed error:", error)
  }
}

// Helper function to create notifications
const createNotification = async (userId, title, message, type) => {
  
  try {
    const notification = new Notification({
      user:userId,
      title,
      message,
      type,
      isRead: false,
    })
    await notification.save()
  } catch (error) {
    console.error("Create notification error:", error.message)
  }
}

