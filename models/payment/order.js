const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true
  },
  payment_id: {
    type: String
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: 'INR'
  },
  payment_status: {
    type: Number,
    enum: [1,2,3],
    default: 1
  },
  payment_method: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
