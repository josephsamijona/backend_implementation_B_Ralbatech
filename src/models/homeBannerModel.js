const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const homebanner = new Schema({
    banner_title: {
        type: String,
        default: ''
    },
    banner_subtitle: {
        type: String,
        default: ''
    },
    banner_store: {
        type: String,
        default: ''
    },
    banner_department: {
        type: String,
        default: ''
    },
    banner_background_image: {
        type: String
    },
    banner_title_color: {
        type: String
    },
    banner_subtitle_color: {
        type: String,
    },
    banner_button_bg_color: {
        type: String,
    },
    banner_button_text_color: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    },
}, { timestamps: true });

// Model

module.exports = mongoose.model('homebanner', homebanner);