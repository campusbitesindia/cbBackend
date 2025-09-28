const express = require('express')
const router = express.Router()

const { isAuthenticated, isStudent } = require("../middleware/auth");
const { createGroupOrder, joinGroupOrder, updateGroupOrder, getGroupOrderByLink, updateGroupOrderItems } = require('../controllers/groupOrder');

router.post('/create-order', isAuthenticated, createGroupOrder);
router.post('/join-group', isAuthenticated, joinGroupOrder);
router.post('/add-items-payment', isAuthenticated, updateGroupOrder);
router.post("/join", isAuthenticated, joinGroupOrder);
router.get("/:groupLink", isAuthenticated, getGroupOrderByLink);
router.post("/items", isAuthenticated, updateGroupOrderItems);

module.exports = router;

