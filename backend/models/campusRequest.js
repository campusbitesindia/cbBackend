const mongoose = require("mongoose");

const CampusRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ["student", "vendor", "canteen"], required: true },
  collegeName: { type: String, required: true },
  city: { type: String, required: true },
  message: { type: String },
  isReviewed: { type: Boolean, default: false },
  approved: { type: Boolean, default: null },
}, { timestamps: true });

module.exports = mongoose.model("CampusRequest", CampusRequestSchema);
