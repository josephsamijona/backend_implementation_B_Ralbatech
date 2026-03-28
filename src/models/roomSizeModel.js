const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const roomsize = new Schema({
    roomsize_name: {
        type: String
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('roomsize', roomsize);