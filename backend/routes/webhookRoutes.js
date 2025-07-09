const express = require("express")
const { handleRazorpayWebhook } = require("../controllers/webhookController")

const router = express.Router()

// Razorpay webhook endpoint
router.post("/razorpay", express.raw({ type: "application/json" }), handleRazorpayWebhook)

module.exports = router
