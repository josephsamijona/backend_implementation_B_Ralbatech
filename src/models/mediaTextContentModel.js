const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const mediaTextContent = new Schema({
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
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor',
        default: null
        // null = MTG créé par l'admin de la plateforme
        // ObjectId = MTG créé par ce vendor (statut initial: pending)
    },
    mtg_status: {
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'active'
        // 'active' pour les MTGs admin existants (migration)
        // 'pending' pour les nouveaux MTGs créés par des vendors
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

module.exports = mongoose.model('mediaTextContent', mediaTextContent);