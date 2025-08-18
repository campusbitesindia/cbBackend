const express = require('express');
const router = express.Router();

const { isAuthenticated, isStudent } = require('../middleware/auth');
const {
  createGroupOrder,
  joinGroupOrder,
  updateGroupOrder,
  getGroupOrderByLink,
  updateGroupOrderItems,
  getAllGroupOrders,
  paySelf,
} = require('../controllers/groupOrder');

// Debug imports
console.log('Middleware imports:', { isAuthenticated, isStudent });
console.log('Controller imports:', {
  createGroupOrder,
  joinGroupOrder,
  updateGroupOrder,
  getGroupOrderByLink,
  updateGroupOrderItems,
  getAllGroupOrders,
});

router.post('/create-order', isAuthenticated, createGroupOrder);
router.post('/join-group', isAuthenticated, joinGroupOrder);
router.post('/add-items-payment', isAuthenticated, updateGroupOrder);
router.post('/join', isAuthenticated, joinGroupOrder); // Consider removing duplicate
router.get('/:groupLink', isAuthenticated, getGroupOrderByLink);
router.post('/items', isAuthenticated, updateGroupOrderItems);
router.get('/getAll', isAuthenticated, getAllGroupOrders);
router.post('/pay-self', isAuthenticated, paySelf);

module.exports = router;