const express = require("express");
const router = express.Router();
const { createCampus, getAllCampuses, deleteCampus, getCampusById, updateCampus } = require("../controllers/campusController");

const { isAuthenticated, isAdmin, isAdminOrVendor } = require("../middleware/auth")

router.post("/create" ,isAuthenticated,isAdminOrVendor, createCampus);
router.get("/", getAllCampuses);
router.get("/:id", getCampusById);
router.put("/:id",isAuthenticated, isAdmin, updateCampus);
router.delete("/:id",isAuthenticated, isAdmin, deleteCampus);

module.exports = router;
