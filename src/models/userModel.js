const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const user = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        unique: true
    },
    user_image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    },
},{timestamps:true});

// Model

module.exports = mongoose.model('user', user);