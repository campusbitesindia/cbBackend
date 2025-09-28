const express = require("express")
const { body } = require("express-validator")
const { isAuthenticated } = require("../middleware/auth")
const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getTransaction,
  getUserTransactions,
  initiateRefund,
  getRefundStatus,
} = require("../controllers/paymentController")
const { CreateCODTransaction } = require("../controllers/cashOnDelivery")

const router = express.Router()

// Create UPI payment order
router.post(
  "/create-order",
  isAuthenticated,
  [body("orderId").isMongoId().withMessage("Valid order ID is required")],
  createPaymentOrder,
)

// Verify UPI payment
router.post(
  "/verify",
  isAuthenticated,
  [
    body("razorpay_order_id").notEmpty().withMessage("Razorpay order ID is required"),
    body("razorpay_payment_id").notEmpty().withMessage("Razorpay payment ID is required"),
    body("razorpay_signature").notEmpty().withMessage("Razorpay signature is required"),
  ],
  verifyPayment,
)

// Handle payment failure
router.post(
  "/failure",
  isAuthenticated,
  [body("razorpay_order_id").notEmpty().withMessage("Razorpay order ID is required")],
  handlePaymentFailure,
)

// Get specific transaction
router.get("/transaction/:transactionId", isAuthenticated, getTransaction)

// Get user transactions with pagination
router.get("/transactions", isAuthenticated, getUserTransactions)

// Initiate full refund
router.post(
  "/refund/:transactionId",
  isAuthenticated,
  [body("reason").optional().isString().withMessage("Reason must be a string")],
  initiateRefund,
)

// Get refund status
router.get("/refund/:transactionId", isAuthenticated, getRefundStatus)

// router for cod transaction
router.post("/COD",isAuthenticated,CreateCODTransaction)

module.exports = router
