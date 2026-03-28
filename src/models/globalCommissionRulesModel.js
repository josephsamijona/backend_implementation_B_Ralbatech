const mongoose = require('mongoose');

// Schema
const Schema = mongoose.Schema;

const globalCommissionRulesSchema = new Schema({
    commission_type: {
        type: String,
        enum: ['product_copy', 'product_3d_image', 'home_banner', 'product_image'],  // Different actions that can trigger commission
        required: true
    },
    admin_commission_percentage: {
        type: Number,  // Admin platform commission percentage
        required: true
    },
    main_vendor_commission_percentage: {
        type: Number,  // Main vendor commission percentage
        required: true
    },
    access_vendor_commission_percentage: {
        type: Number,  // Commission for the access vendor (if applicable)
        default: 0
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Model
module.exports = mongoose.model('globalCommissionRules', globalCommissionRulesSchema);
