const Reviews = require('../models/Review');
const Canteen = require("../models/Canteen");
const User = require("../models/User");
const Item = require("../models/Item");
const mongoose=require("mongoose")
// GET all reviews for a canteen
exports.getReviews = async (req, res) => {
  try {
    const { canteenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(canteenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid canteen ID',
      });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found',
      });
    }

    const reviews = await Reviews.find({
      canteen: canteen._id,
      isDeleted: false,
    })
      .populate({ path: 'student', select: 'name' })
      .populate({ path: 'canteen', select: 'name' })
      .populate({ path: 'item', select: 'name' });

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reviews found for this canteen',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All reviews fetched successfully',
      data: reviews,
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// POST review for a canteen or item
exports.createReview = async (req, res) => {
  try {
    const { canteenId, itemId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!canteenId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Canteen ID and rating are required',
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(canteenId) ||
      (itemId && !mongoose.Types.ObjectId.isValid(itemId))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid canteen or item ID',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found',
      });
    }

    let item = null;
    if (itemId) {
      item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }
    }

    const newReview = await Reviews.create({
      student: user._id,
      canteen: canteen._id,
      item: item ? item._id : null,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview,
    });
  } catch (err) {
    console.error('Create review error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// GET all reviews for an item
exports.getAllReviewForItem = async (req, res) => {
  try {
    const { id: itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const reviews = await Reviews.find({ item: item._id, isDeleted: false })
      .populate({ path: 'student', select: 'name' })
      .populate({ path: 'canteen', select: 'name' })
      .populate({ path: 'item', select: 'name' });

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reviews found for this item',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item reviews fetched successfully',
      data: reviews,
    });
  } catch (err) {
    console.error('Get item reviews error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// GET average rating for a canteen
exports.getCanteenAverageRating = async (req, res) => {
  try {
    const { id: canteenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(canteenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid canteen ID',
      });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: 'Canteen not found',
      });
    }

    const averageReview = await Reviews.aggregate([
      {
        $match: {
          canteen: new mongoose.Types.ObjectId(canteenId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const averageRating =
      averageReview.length > 0
        ? averageReview[0].averageRating.toFixed(2)
        : '0.00';

    return res.status(200).json({
      success: true,
      message: 'Average rating fetched successfully',
      data: {
        canteen: { _id: canteen._id, name: canteen.name },
        averageRating,
      },
    });
  } catch (err) {
    console.error('Get canteen average rating error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// GET average rating for an item
exports.getItemAverageRating = async (req, res) => {
  try {
    const { id: itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID',
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const averageReview = await Reviews.aggregate([
      {
        $match: {
          item: new mongoose.Types.ObjectId(itemId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const averageRating =
      averageReview.length > 0
        ? averageReview[0].averageRating.toFixed(2)
        : '0.00';

    return res.status(200).json({
      success: true,
      message: 'Average rating of item fetched successfully',
      data: {
        item: { _id: item._id, name: item.name },
        averageRating,
      },
    });
  } catch (err) {
    console.error('Get item average rating error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    const review = await Reviews.findOne({ _id: reviewId, student: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized',
      });
    }

    review.isDeleted = true;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};
