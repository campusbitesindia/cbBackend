const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/reviewController')
const { route } = require('./itemRoutes')

router.get('/:canteenId', reviewController.getReviews)
router.post('/', reviewController.createReview)

module.exports = router;