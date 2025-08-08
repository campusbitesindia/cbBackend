const mongoose = require("mongoose");

const groupOrderSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groupLink: { type: String, required: true, unique: true },
  qrCodeUrl: { type: String, required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  orderNumber: { type: Number, required: true, unique: true, min: 100000, max: 99999999 },
  items: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
      quantity: { type: Number, default: 1 },
      nameAtPurchase: { type: String },
      priceAtPurchase: { type: Number }
    }
  ],
  totalAmount: { type: Number, default: 0 },
  paymentDetails: {
    splitType: { type: String, enum: ["equal", "custom"], default: "equal" },
    amounts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, min: 0 }
      }
    ],
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentMethod: { type: String, enum: ["upi", "cod"], default: "upi" },
    transactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
        status: { type: String, enum: ["created", "attempted", "paid", "failed", "cancelled", "refunded"], default: "created" }
      }
    ]
  },
  status: {
    type: String,
    enum: ["pending", "payment_pending", "placed", "preparing", "ready", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

groupOrderSchema.index({ groupLink: 1 });
groupOrderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model("GroupOrder", groupOrderSchema);