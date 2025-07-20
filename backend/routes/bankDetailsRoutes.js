const express = require("express")
const router = express.Router()
const {
  getBankDetails,
  updateBankDetails,
  getAllBankDetails,
  verifyBankDetails,
  deleteBankDetails,
} = require("../controllers/bankDetailsController")
const { isAuthenticated, isVendor, isAdmin } = require("../middleware/auth")

// Vendor routes
router.get("/", isAuthenticated, isVendor, getBankDetails)
router.post("/", isAuthenticated, isVendor, updateBankDetails)
router.put("/", isAuthenticated, isVendor, updateBankDetails)
router.delete("/", isAuthenticated, isVendor, deleteBankDetails)

// Admin routes
router.get("/admin/all", isAuthenticated, isAdmin, getAllBankDetails)
router.post("/admin/:bankDetailsId/verify", isAuthenticated, isAdmin, verifyBankDetails)

module.exports = router
