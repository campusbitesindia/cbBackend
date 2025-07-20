const mongoose = require("mongoose");

const PayoutSchema = new mongoose.Schema({
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trnId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Payout", PayoutSchema);
