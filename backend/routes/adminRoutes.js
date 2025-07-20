const express = require("express")
const router = express.Router()
const {
  getTotalCounts,
  getMonthlyUserCount,
  getUserCountByRole,
  getTopUsersBySpending,
  getUsersByRoleList,
  getMonthlyOrders,
  getOrdersByCampusCanteen,
  getOrderStatusBreakdown,
  getTopCanteensByOrderVolume,
  getAverageOrderValue,
  getPeakOrderTimes,
  getTotalRevenue,
  getRevenueByPaymentMethod,
  getDailyRevenue,
  getWeeklyRevenue,
  getMonthlyRevenue,
  banUser,
  suspendCanteen,
  adminRateVendor,
  getRevenueByCampusAndCanteen,
  getTopCampusesByRevenue,
  getTopCanteensByRevenue,
  getCampusesSummary,
  getCampusUsers,
  getCampusCanteens,
  getUserDetails,
  getCanteenDetails,
  submitCampusRequest,
  getAllCanteens,
  getAllCampusRequests,
  createAdminAccount,
  reviewCampusRequest,
  adminLogin,
  getPendingVendors,
  approveVendor,
  getVendorDetails,
  createPayout,
  getPayouts,
  getPayoutsByCanteen,getSuspectedUser
} = require("../controllers/adminController")
const { isAuthenticated, isAdmin, isAdminEnv } = require("../middleware/auth")

router.get("/totals", getTotalCounts)
router.get("/users/monthly", getMonthlyUserCount)
router.get("/users/count-by-role", getUserCountByRole)
router.get("/users/getSuspectedUser",getSuspectedUser);
router.get("/users/top-spenders", getTopUsersBySpending)
router.get("/users/list-by-role", getUsersByRoleList)
router.get("/orders/monthly", getMonthlyOrders)
router.get("/orders/by-campus-canteen", getOrdersByCampusCanteen)
router.get("/orders/status-wise", getOrderStatusBreakdown)
router.get("/orders/top-tcanteens", getTopCanteensByOrderVolume)
router.get("/orders/average-order-value", getAverageOrderValue)
router.get("/orders/peak-hours", getPeakOrderTimes)
router.get("/revenue/total", getTotalRevenue)
router.get("/revenue/by-campus-canteen", getRevenueByCampusAndCanteen)
router.get("/revenue/top-canteens", getTopCanteensByRevenue)
router.get("/revenue/top-campuses", getTopCampusesByRevenue)
router.get("/revenue/payment-breakdown", getRevenueByPaymentMethod)
router.get("/revenue/daily", getDailyRevenue)
router.get("/revenue/weekly", getWeeklyRevenue)
router.get("/revenue/monthly", getMonthlyRevenue)
router.post("/banUser", banUser)
router.post("/suspendCanteen", suspendCanteen)
router.post("/rateVendors", adminRateVendor)
router.post("/create-admin", createAdminAccount)
router.post("/login", adminLogin)
router.get("/campuses-summary", getCampusesSummary)
router.get("/campus/:campusId/users", getCampusUsers)
router.get("/campus/:campusId/canteens", getCampusCanteens)
router.get("/user/:userId", getUserDetails)
router.get("/canteen/:canteenId", getCanteenDetails)
router.post("/campus-request", submitCampusRequest)
router.get("/canteens", getAllCanteens)
router.get("/campus-requests", isAuthenticated, isAdmin, getAllCampusRequests)
router.patch("/campus-requests/:id/review", isAuthenticated, isAdmin, reviewCampusRequest)

// Add these routes to adminRoutes.js
router.get("/vendors/pending", isAuthenticated, isAdmin, getPendingVendors)
router.post("/vendors/:canteenId/approve", isAdminEnv, approveVendor)
router.get("/vendors/:canteenId/details", isAuthenticated, isAdmin, getVendorDetails)

// Payout routes
router.post("/payouts", isAuthenticated, isAdmin, createPayout)
router.get("/payouts", isAuthenticated, isAdmin, getPayouts)
router.get("/payouts/canteen/:canteenId", isAuthenticated, isAdmin, getPayoutsByCanteen)

// Protect all routes below with isAdminEnv
router.use(isAdminEnv)

module.exports = router
