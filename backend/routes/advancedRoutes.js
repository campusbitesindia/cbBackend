const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/advanceController');

router.get('/', searchAll);
 
module.exports = router; 