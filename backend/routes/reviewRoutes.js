const express = require('express')
const router = express.Router()
const{getReviews,getAllReviewForItem,getCanteenAverageRating,getItemAverageRating,createReview}= require('../controllers/reviewController')
const{ isAuthenticated, isStudent }=require("../middleware/auth");


router.get('/:canteenId', getReviews)
router.post('/create',isAuthenticated,isStudent,createReview)

router.get("/ItemReviews/:id",getAllReviewForItem);
router.get("/ItemAverageReview/:id",getItemAverageRating);
router.get("/CanteenAverageReview/:id",getCanteenAverageRating);

module.exports = router;