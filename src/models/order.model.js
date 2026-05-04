const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'pending'
  }
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
