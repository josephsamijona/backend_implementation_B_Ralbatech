const { string } = require('joi');
const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const cart = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    products: [{
        pro_id: {
            type: Schema.Types.ObjectId,
            ref: 'product'
        },
        pro_name: {
            type: String,
        },
        pro_image: {
            type: String,
        },
        pro_slug: {
            type: String,
        },
        left_eye_qty: {
            type: Number,
        },
        right_eye_qty: {
            type: Number,
        },
        qty: {
            type: Number,
        },
        price: {
            type: Number,
        },
        addons: {
            type: Array,
        },
        sub_total: {
            type: Number,
        },
        addonsprice: {
            type: Number
        }
    }],
    total: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('cart', cart);