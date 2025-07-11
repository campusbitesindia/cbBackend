const express = require("express");
const router = express.Router();
const { getMenuByCanteenId, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menuController");

// Get menu items by canteen ID
router.get("/:canteenId", getMenuByCanteenId);

// Create new menu item
router.post("/", createMenuItem);

// Update menu item
router.put("/:id", updateMenuItem);

// Delete menu item
router.delete("/:id", deleteMenuItem);

module.exports = router; 