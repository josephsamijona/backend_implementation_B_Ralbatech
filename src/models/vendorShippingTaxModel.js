const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const vendorshippingtax = new Schema({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    shipping_charge: {
        type: Number
    },
    tax_percentage: {
        type: Number,
        unique: true
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    },
},{timestamps:true});

// Model

module.exports = mongoose.model('vendorshippingtax', vendorshippingtax);