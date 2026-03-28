const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const orderdetails = new Schema({
    order_id: {
        type: Schema.Types.ObjectId,
    },
    store_id: {
        type: Schema.Types.ObjectId,
        ref: 'store'
    },
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    department_id: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    product_name: {
        type: String,
    },
    product_image: {
        type: String,
    },
    product_slug: {
        type: String,
    },
    qty: {
        type: Number,
    },
    left_eye_qty: {
        type: Number,
    },
    right_eye_qty: {
        type: Number,
    },
    price: {
        type: Number,
    },
    addons: {
        type: Array,
    },
    addonsprice: {
        type: Number,
    },
    commission_details:{
        type: Array,
    }    

}, { timestamps: true });

// Model

module.exports = mongoose.model('orderdetails', orderdetails);