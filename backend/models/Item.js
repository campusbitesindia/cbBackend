const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  // menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  available: { type: Boolean, default: true },
  image: { type: String },
  isDeleted: { type: Boolean, default: false },
  isReady: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Item", ItemSchema);
