const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['student', 'canteen'], required: true },
  subscription: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PushSubscriptionSchema.index({ user: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema); 