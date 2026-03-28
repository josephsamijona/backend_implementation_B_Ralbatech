const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const adminSetting = new Schema({
    addto_cart_status: {
        type: String,
        enum : ['active','inactive'],
        default: 'inactive'
    },
    quentity_status: {
        type: String,
        enum : ['active','inactive'],
        default: 'inactive'
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('adminSetting', adminSetting);