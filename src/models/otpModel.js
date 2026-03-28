const mongoose = require('mongoose');
const { now } = require('../libs/timeLib');

// Schema

const Schema = mongoose.Schema;
const otp = new Schema({
    phone: {
        type: String
    },
    otpType: {
        type: String
    },
    otpValue: {
        type: Number,
        index: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        index: { expires: '3m', }
    }
    // created_at: {
    //     type: Date,
    //     expires: '4m',
    //     default: Date.now
    // },
});

// Model

module.exports = mongoose.model('otp', otp);