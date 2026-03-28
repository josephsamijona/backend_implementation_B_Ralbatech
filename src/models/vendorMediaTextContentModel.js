const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const vendorMediaTextContent = new Schema({
    media_text_contain_id: {
        type: Schema.Types.ObjectId,
        ref: 'mediaTextContent'
    },
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    heading_text: {
        type: String
    },
    description_text: {
        type: String,
    },
    section_image: {
        type: String
    },
    section_image_name: {
        type: String
    },
    position: {
        type: Number,   // New field to store the order of the item
        default: 0
    },
    tags:{
        type: Array,
    },
    mtg_status: {
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'pending'
        // 'pending' quand un vendor crée un nouveau MTG (doit être approuvé par admin)
        // 'active' après approbation admin
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

module.exports = mongoose.model('vendorMediaTextContent', vendorMediaTextContent);