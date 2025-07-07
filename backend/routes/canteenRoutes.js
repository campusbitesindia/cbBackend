const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { createCanteen, getAllCanteens, deleteCanteen, getCanteenById, updateCanteen } = require("../controllers/canteenController");

// Multer expects form-data with 'images' key
router.post("/create", upload.array("images", 5), createCanteen);
router.get("/", getAllCanteens);
router.get("/:id", getCanteenById);
router.put("/:id", upload.array("images", 5), updateCanteen);
router.delete("/:id", deleteCanteen);

module.exports = router;
