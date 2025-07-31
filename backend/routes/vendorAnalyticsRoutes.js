const express = require("express");
const router = express.Router();
const vendorAnalyticsController = require("../controllers/vendorAnalytics");

// Middleware to verify vendor ownership of canteen
async function verifyVendorAccess(req, res, next) {
  try {
    console.log(req.params);
    const { canteenId } = req.params;
    const vendorId = req.user._id;

    const Canteen = require("../models/Canteen");
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });
    if (canteen.owner.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this canteen" });
    }

    req.canteen = canteen;
    next();
  } catch (err) {
    console.error("Vendor access verification failed", err);
    return res.status(500).json({ message: "Server error" });
  }
}

const { isAuthenticated } = require("../middleware/auth"); // adjust path as needed

router.use(isAuthenticated);

router.get(
  "/:canteenId/basic",
  verifyVendorAccess,
  vendorAnalyticsController.getBasicDashboard
);

// Financial overview
router.get(
  "/:canteenId/finance",
  verifyVendorAccess,
  vendorAnalyticsController.getFinancialOverview
);

// Order performance analytics
router.get(
  "/:canteenId/orders",
  verifyVendorAccess,
  vendorAnalyticsController.getOrderPerformance
);

// Item sales analysis
router.get(
  "/:canteenId/items",
  verifyVendorAccess,
  vendorAnalyticsController.getItemSalesAnalysis
);

// Operating metrics
router.get(
  "/:canteenId/operating",
  verifyVendorAccess,
  vendorAnalyticsController.getOperatingMetrics
);

module.exports = router;
