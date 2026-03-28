const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const brand = new Schema({
    brand_name: {
        type: String
    },
    categories: 
    [
        Object
    ],
    brand_slug: {
        type: String,
    },
    brand_image: {
        type: String
    },
    brand_image_name: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('brand', brand);