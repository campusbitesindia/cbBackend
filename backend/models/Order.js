const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, default: 1 },
      nameAtPurchase: { type: String },
      priceAtPurchase: { type: Number },
    },
  ],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending","placed", "preparing", "ready", "completed", "cancelled"],
    default: "pending",
  },
  isDeleted: { type: Boolean, default: false },
  pickupTime:{
    type:String,
    required:true
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
