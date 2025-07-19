const express = require("express")
const router = express.Router()
const {
  getBalance,
  requestPayout,
  getPayoutHistory,
  getPayoutStatus,
  getAllPayoutRequests,
  reviewPayoutRequest,
  processPayout,
} = require("../controllers/payoutController")
const { isAuthenticated, isVendor, isAdmin } = require("../middleware/auth")

// Vendor routes
router.get("/balance", isAuthenticated, isVendor, getBalance)
router.post("/request", isAuthenticated, isVendor, requestPayout)
router.get("/history", isAuthenticated, isVendor, getPayoutHistory)
router.get("/status/:requestId", isAuthenticated, isVendor, getPayoutStatus)

// Admin routes
router.get("/admin/all", isAuthenticated, isAdmin, getAllPayoutRequests)
router.post("/admin/:requestId/review", isAuthenticated, isAdmin, reviewPayoutRequest)
router.post("/admin/:requestId/process", isAuthenticated, isAdmin, processPayout)

module.exports = router
