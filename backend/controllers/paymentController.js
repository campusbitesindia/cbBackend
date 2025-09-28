const razorpay = require("../config/razorpay")
const Transaction = require("../models/Transaction")
const Order = require("../models/Order")
const User = require("../models/User")
const SendNotification=require("../utils/sendNotification");
const crypto = require("crypto")
const { validationResult } = require("express-validator")

// Create Razorpay order (UPI only)
const createPaymentOrder = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { orderId } = req.body
    const userId = req.user.id

    // Find the order
    const order = await Order.findById(orderId).populate("student")
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if user owns the order
       if (order.student._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order",
      })
    }

    // Check if payment already exists for this order
    const existingTransaction = await Transaction.findOne({
      orderId: orderId,
      status: { $in: ["paid"] },
    })

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: "Payment already initiated for this order",
        transactionId: existingTransaction._id,
      })
    }

    // Calculate amount (in paise for Razorpay)
    const amount = Math.round(order.total * 100)
  
    // Create Razorpay order with UPI preference
    const razorpayOrder = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,//length of Reciept was greater than 40 so it was throwing error
       //method field was removed as it was not a part of orders.create method and giving error
      notes: {
        orderId: orderId,
        userId:userId ,
        canteenId: order.canteen,
      },
    })

    // Create transaction record
    const transaction = new Transaction({
      orderId: orderId,
      userId: userId,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      currency: "INR",
      status: "created",
      paymentMethod: "upi",
    })

    await transaction.save()

    // Update order status
    order.status = "payment_pending"
    await order.save()

    res.status(201).json({
      success: true,
      message: "UPI payment order created successfully",
      data: {
        transactionId: transaction._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        method: "upi",
      },
      razorpayOrder
    })
  } catch (error) {
    console.error("Create payment order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
}

// Verify UPI payment
const verifyPayment = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    // Find transaction
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
    }).populate("orderId")

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    // Check if user owns the transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to transaction",
      })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      // Update transaction as failed
      transaction.status = "failed"
      transaction.failureReason = "Invalid signature"
      await transaction.save()

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      })
    }

    // Get payment details from Razorpay to confirm it's UPI
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    if (payment.method !== "upi") {
      transaction.status = "failed"
      transaction.failureReason = "Invalid payment method"
      await transaction.save()

      return res.status(400).json({
        success: false,
        message: "Only UPI payments are allowed",
      })
    }

    // Update transaction
    transaction.razorpayPaymentId = razorpay_payment_id
    transaction.razorpaySignature = razorpay_signature
    transaction.status = "paid"
    transaction.paymentMethod = "upi"
    transaction.paidAt = new Date()
    await transaction.save()

    // Update order status
    const order = await Order.findById(transaction.orderId).populate("canteen student")
    order.status = "placed"
    order.paymentStatus = "paid"
    order.paidAt = new Date()
    await order.save()
    await SendNotification(order.student, "Order Placed", "Your Order has been Placed");
    const canteenOwner=await User.findOne({canteenId:order.canteen._id})
     await SendNotification(
            canteenOwner._id,
            "New Order",
            `New Order has arrived with Order ID ${order.OrderNumber}`
          );

    global.io.to(order.canteen._id.toString()).emit("New_Order",order);
    res.status(200).json({
      success: true,
      message: "UPI payment verified successfully",
      data: {
        transactionId: transaction._id,
        orderId: order._id,
        status: "paid",
        paymentMethod: "upi",
      },
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
}

// Handle payment failure
const handlePaymentFailure = async (req, res) => {
    try {
        const { razorpay_order_id, error } = req.body

        // Find transaction
        const transaction = await Transaction.findOne({
        razorpayOrderId: razorpay_order_id,
        }).populate("orderId")

        if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found",
        })
        }

        // Check if user owns the transaction
        if (transaction.userId.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access to transaction",
        })
        }

        // Update transaction as failed
        transaction.status = "failed"
        transaction.failureReason = error?.description || "UPI payment failed"
        await transaction.save()

        // Update order status
        const order = transaction.orderId
        order.status = "pending"
        order.paymentStatus = "failed"
        await order.save()

        res.status(200).json({
        success: true,
        message: "Payment failure recorded",
        data: {
            transactionId: transaction._id,
            orderId: order._id,
            status: "failed",
        },
        })
    } catch (error) {
        console.error("Handle payment failure error:", error.message)
        res.status(500).json({
        success: false,
        message: "Failed to handle payment failure",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        })
    }
    }

    // Get transaction details
    const getTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params
        const userId = req.user.id

        const transaction = await Transaction.findById(transactionId)
        .populate("orderId")
        .populate("userId", "name email")
        .populate("refund.initiatedBy", "name email")

        if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found",
        })
        }

        // Check if user owns the transaction
        if (transaction.userId._id.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access to transaction",
        })
        }

        res.status(200).json({
        success: true,
        message: "Transaction retrieved successfully",
        data: transaction,
        })
    } catch (error) {
        console.error("Get transaction error:", error)
        res.status(500).json({
        success: false,
        message: "Failed to retrieve transaction",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        })
    }
}

// Get user transactions
const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id
        const { page = 1, limit = 10, status } = req.query

        const query = { userId }
        if (status) {
        query.status = status
        }

        const skip = (page - 1) * limit

        const transactions = await Transaction.find(query)
        .populate("orderId", "orderNumber totalAmount items")
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))

        const total = await Transaction.countDocuments(query)

        res.status(200).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: {
            transactions,
            pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalTransactions: total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
            },
        },
        })
    } catch (error) {
        console.error("Get user transactions error:", error)
        res.status(500).json({
        success: false,
        message: "Failed to retrieve transactions",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        })
    }
    }

    // Initiate full refund (100% amount only)
    const initiateRefund = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors: errors.array(),
        })
        }

        const { transactionId } = req.params
        const { reason } = req.body
        const userId = req.user.id

        // Find transaction
        const transaction = await Transaction.findById(transactionId).populate("orderId")
        if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found",
        })
        }

        // Check if user owns the transaction (or is admin - you can add admin check here)
        if (transaction.userId.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access to transaction",
        })
        }

        // Check if transaction can be refunded
        if (!transaction.canRefund()) {
        return res.status(400).json({
            success: false,
            message: "Transaction cannot be refunded",
            details: {
            status: transaction.status,
            alreadyRefunded: transaction.isRefunded(),
            refundInProgress: transaction.refund.status === "pending",
            },
        })
        }

        // Create full refund with Razorpay (full amount)
        const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
        amount: Math.round(transaction.amount * 100), // Full amount in paise
        notes: {
            reason: reason || "Full refund requested",
            orderId: transaction.orderId._id.toString(),
            initiatedBy: userId,
            refundType: "full",
        },
        })

        // Update transaction with refund info
        transaction.initiateRefund(reason || "Full refund requested", userId)
        transaction.refund.refundId = refund.id
        await transaction.save()

        res.status(200).json({
        success: true,
        message: "Full refund initiated successfully",
        data: {
            refundId: refund.id,
            amount: transaction.amount,
            status: refund.status,
            transactionStatus: transaction.status,
            note: "Full payment amount will be refunded",
        },
        })
    } catch (error) {
        console.error("Initiate refund error:", error)
        res.status(500).json({
        success: false,
        message: "Failed to initiate refund",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        })
    }
}

// Get refund status
const getRefundStatus = async (req, res) => {
    try {
        const { transactionId } = req.params
        const userId = req.user.id

        // Find transaction
        const transaction = await Transaction.findById(transactionId)
        .populate("orderId")
        .populate("refund.initiatedBy", "name email")

        if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found",
        })
        }

        // Check if user owns the transaction
        if (transaction.userId.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access to transaction",
        })
        }

        // Check if refund exists
        if (!transaction.refund.refundId) {
        return res.status(404).json({
            success: false,
            message: "No refund found for this transaction",
        })
        }

        // Get refund status from Razorpay
        try {
        const razorpayRefund = await razorpay.refunds.fetch(transaction.refund.refundId)

        res.status(200).json({
            success: true,
            message: "Refund status retrieved successfully",
            data: {
            transactionId: transaction._id,
            refundId: transaction.refund.refundId,
            amount: transaction.amount,
            reason: transaction.refund.reason,
            status: transaction.refund.status,
            initiatedAt: transaction.refund.initiatedAt,
            processedAt: transaction.refund.processedAt,
            razorpayStatus: razorpayRefund.status,
            transactionStatus: transaction.status,
            },
        })
        } catch (razorpayError) {
        res.status(200).json({
            success: true,
            message: "Refund status retrieved successfully (local data only)",
            data: {
            transactionId: transaction._id,
            refundId: transaction.refund.refundId,
            amount: transaction.amount,
            reason: transaction.refund.reason,
            status: transaction.refund.status,
            initiatedAt: transaction.refund.initiatedAt,
            processedAt: transaction.refund.processedAt,
            transactionStatus: transaction.status,
            note: "Could not fetch latest status from Razorpay",
            },
        })
        }
    } catch (error) {
        console.error("Get refund status error:", error)
        res.status(500).json({
        success: false,
        message: "Failed to retrieve refund status",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        })
    }
}

module.exports = {
    createPaymentOrder,
    verifyPayment,
    handlePaymentFailure,
    getTransaction,
    getUserTransactions,
    initiateRefund,
    getRefundStatus,
}
