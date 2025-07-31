const express = require('express');
const router = express.Router();
const { getReviews, getAllReviewForItem, getCanteenAverageRating, getItemAverageRating, createReview, deleteReview } = require('../controllers/reviewController');
const { isAuthenticated, isStudent } = require("../middleware/auth");

// Get all reviews for a canteen
router.get('/:canteenId', getReviews);

// Create a review for a canteen or item
router.post('/create', isAuthenticated, isStudent, createReview);

// Get all reviews for an item
router.get("/item-reviews/:id", getAllReviewForItem);

// Get average rating for an item
router.get("/item-average-rating/:id", getItemAverageRating);

// Get average rating for a canteen
router.get("/canteen-average-rating/:id", getCanteenAverageRating);

router.delete('/delete/:reviewId', isAuthenticated, isStudent, deleteReview);

module.exports = router;