const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  OrderNumber:{
    type:String,
    required:true
  },
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
    enum: ["pending","placed", "preparing", "ready", "completed", "cancelled","payment_pending","payment_failed"],
    default: "pending",
  },
  isDeleted: { type: Boolean, default: false },
  pickupTime:{
    type:String,
    required:true
  },
  paymentStatus:{
    type:String
  },
  paidAt:{
    type:Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
