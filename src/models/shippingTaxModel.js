const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const shippingtax = new Schema({
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

module.exports = mongoose.model('shippingtax', shippingtax);