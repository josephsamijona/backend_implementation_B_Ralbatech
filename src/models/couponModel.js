const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    coupon_name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    coupon_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },

    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
    },

    discount: {
      type: Number,
      required: true,
      min: 0
    },

    min_order_amount: {
      type: Number,
      default: 0,
      min: 0
    },

    per_user_limit: {
      type: Number,
      default: 1,
      min: 1,
      required: true
    },

    start_date: {
      type: Date,
      required: true
    },

    end_date: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    total_usage_count: {
      type: Number,
      default: 0,
    },

    is_active: {
      type: Boolean,
      default: true
    },

    website_view: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
