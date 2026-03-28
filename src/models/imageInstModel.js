const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const imageinst = new Schema({
    image_instruction: {
        type: String
    },
    page_image: {
        type: String,
    },
    image_size: {
        type: String,
    },
    image_width: {
        type: String,
    },
    image_height: {
        type: String,
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('imageinst', imageinst);