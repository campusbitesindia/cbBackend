const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  available: { type: Boolean, default: true },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
   description: { type: String, default:null },
    category: { type: String, default: "General" },
  isDeleted: { type: Boolean, default: false },
  portion:{
    type:String
  },
  quantity:{
    type:String
  },
  isReady: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Item", ItemSchema);
