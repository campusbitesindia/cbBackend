const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/advanceController');
const{isAuthenticated}=require("../middleware/auth")
router.get('/',isAuthenticated, searchAll);
 
module.exports = router; 