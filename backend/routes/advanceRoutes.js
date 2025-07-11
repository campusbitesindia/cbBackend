const express = require('express');
const { getRecommendations, peopleAlsoOrdered } = require('../controllers/advanceController');
const router = express.Router();

router.get("/recommendations/:userId", getRecommendations);
router.get("/also/:itemId", peopleAlsoOrdered);

module.exports =router;
