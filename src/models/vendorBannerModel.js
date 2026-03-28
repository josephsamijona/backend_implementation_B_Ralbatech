const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const vendorbanner = new Schema({
    vendor_id: {
        type: Schema.Types.ObjectId,
    },
    banner_title: {
        type: String,
        default: ''
    },
    banner_subtitle: {
        type: String,
        default: ''
    },
    banner_background_image: {
        type: String
    },
    banner_background_image_name : {
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
    banner_top_brands:{
        type: Array,
    },
    banner_homepage_brands:{
        type: Array,
    },
    banner_sub_categories:{
        type: Array,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    },
}, { timestamps: true });

// Model

module.exports = mongoose.model('vendorbanner', vendorbanner);