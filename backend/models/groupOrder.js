const mongoose = require('mongoose');

const groupOrderSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'completed'], default: 'pending' },
  paymentDetails: {
    splitType: { type: String, enum: ['equal', 'custom', 'single'], default: 'equal' },
    amounts: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: Number }],
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  groupLink: { type: String, unique: true },
  qrCodeUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupOrder', groupOrderSchema);