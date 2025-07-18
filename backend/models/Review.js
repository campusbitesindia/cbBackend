const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);
