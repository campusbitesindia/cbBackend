const express = require('express');
const router = express.Router();
const { getMyOrders, createOrder, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes here are protected
router.route('/')
    .get(protect, getMyOrders)
    .post(protect, createOrder);

router.route('/:id')
    .get(protect, getOrderById);

module.exports = router; 