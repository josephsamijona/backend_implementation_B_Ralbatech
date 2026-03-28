const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },

    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      required: true
    },

    usedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true   
  }
);

module.exports = mongoose.model('CouponUsage', couponUsageSchema);
