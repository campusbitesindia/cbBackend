const Review = require('../models/Review')

// GET reviews for a canteen
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ canteen: req.params.canteenId })
        res.json(reviews)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// works

// POST review
exports.createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body)
        res.status(201).json(review)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
// works
