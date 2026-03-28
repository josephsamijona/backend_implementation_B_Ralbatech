const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const returnduration = new Schema({
    return_duration: {
        type: Number,
        default: 7
    },
},{timestamps:true});

// Model

module.exports = mongoose.model('returnduration', returnduration);