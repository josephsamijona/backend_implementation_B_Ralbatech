const { number } = require('joi');
const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const userAddress = new Schema({
    user_id: {
        type: String
    },
    user_full_name: {
        type: String,
    },
    addressline1: {
        type: String,
    },
    addressline2: {
        type: String,
    },
    city: {
        type: String,
    },
    postal_code: {
        type: Number,
    },
    mobile: {
        type: String,
    },
    state: {
        type: String,
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    },
    is_default:
    {
        type: String,
        enum : ['1','0'],
        default: '0'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('useraddress', userAddress);