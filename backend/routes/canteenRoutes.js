const express = require("express")
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")
const {
  createCanteen,
  getAllCanteens,
  deleteCanteen,
  getCanteenById,
  updateCanteen,
  getMyCanteen,
} = require("../controllers/canteenController")
const { isAuthenticated, isVendor } = require("../middleware/auth")

// Multer expects form-data with 'images' key
router.post("/create", isAuthenticated, isVendor, upload.array("images", 5), createCanteen)
router.get("/", getAllCanteens)
router.get("/my-canteen", isAuthenticated, isVendor, getMyCanteen)
router.get("/:id", getCanteenById)
router.put("/:id", isAuthenticated, isVendor, upload.array("images", 5), updateCanteen)
router.delete("/:id", isAuthenticated, isVendor, deleteCanteen)

module.exports = router
