const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const addon = new Schema({
    
    product_category_id: {
        // type: Schema.Types.ObjectId,
        // ref: 'category'
        type: String
    },
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },    
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    },   
    add_ons: {
        type: Array
    }

}, { timestamps: true });

// Model

module.exports = mongoose.model('addon', addon);