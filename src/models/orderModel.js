const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const order = new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    shipping_charge: {
        type: Number,
        default: 0.00
    },
    tax_amount: {
        type: Number,
        default: 0.00
    },
    total_order_amount: {
        type: Number,
        default: 0.00
    },

    order_status: {
        type: String,
        enum : ['pending','initiated','placed','accepted','dispatched','delivered','return requested','return approved','return in transit','return received','refunded'],
        default: 'initiated'
    },
    order_delivery_date: {
        type: Date,
        default: () => {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 10);
            return currentDate;
        }
    },
    payment_status: {
        type: String,
    },
    payment_method: {
        type: String,
        enum : ['COD','paypal']
    },
    payment_id:{
        type: Schema.Types.ObjectId,
        ref: 'payment'
    },
    transaction_id: {
        type: String,
    },
    shipping_address_id:{
        type: Schema.Types.ObjectId,
        ref: 'userAddress'
    },
    billing_email: {
        type: String,
    },
    billing_phone: {
        type: String,
    },
    billing_country: {
        type: String,
    },
    billing_first_name: {
        type: String,
    },
    billing_last_name: {
        type: String,
    },
    billing_address1: {
        type: String,
    },
    billing_address2: {
        type: String,
    },
    billing_city: {
        type: String,
    },
    billing_state: {
        type: String,
    },
    billing_zip: {
        type: String,
    },
    return_reason: {
        type: String,
    },
    return_address: {
        type: String,
    },
    return_requested_at: {
        type: Date,
    },
    discount: {
        type: Number,
        default: 0.00
    },
    
},{timestamps:true});

// Model

module.exports = mongoose.model('order', order);