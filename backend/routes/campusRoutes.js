const express = require("express")
const router = express.Router()
const {
  createCampus,
  getAllCampuses,
  deleteCampus,
  getCampusById,
  updateCampus,
  requestCampusCreation,
} = require("../controllers/campusController")

const { isAuthenticated, isAdmin, isVendor } = require("../middleware/auth")

// Admin only routes
router.post("/create", isAuthenticated, isAdmin, createCampus)
router.put("/:id", isAuthenticated, isAdmin, updateCampus)
router.delete("/:id", isAuthenticated, isAdmin, deleteCampus)

// Vendor can request campus creation
router.post("/request", isAuthenticated, isVendor, requestCampusCreation)

// Public routes (anyone can view campuses)
router.get("/", getAllCampuses)
router.get("/:id", getCampusById)

module.exports = router
