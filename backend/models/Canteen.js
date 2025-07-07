const mongoose = require("mongoose");

const adminRatingSchema = new mongoose.Schema({
  rating: Number,
  feedback: String,
  date: { type: Date, default: Date.now }
});

const CanteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isOpen: { type: Boolean, default: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  images: [{ type: String }],
  adminRatings: [adminRatingSchema],
  isDeleted: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Canteen", CanteenSchema);