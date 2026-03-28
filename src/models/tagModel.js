const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const tag = new Schema({
    tag_name: {
        type: String
    },
    tag_slug: {
        type: String,
    },
    tag_description: {
        type: String
    },
    tag_image: {
        type: String
    },
    tag_image_name: {
        type: String
    },
    web_view_status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('tag', tag);