const express = require("express");
const router = express.Router();
const { createCampus, getAllCampuses, deleteCampus, getCampusById, updateCampus } = require("../controllers/campusController");

router.post("/create", createCampus);
router.get("/", getAllCampuses);
router.get("/:id", getCampusById);
router.put("/:id", updateCampus);
router.delete("/:id", deleteCampus);

module.exports = router;
