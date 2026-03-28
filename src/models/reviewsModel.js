const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const reviewSchema = new Schema({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor',
        required: true,
        index: true
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product',
        default: null,
        index: true
        // null = review générale du vendor (pas liée à un produit)
    },
    reviewer_email: {
        type: String,
        default: ''
        // Optionnel — laisser vide si non fourni
    },
    comment_text: {
        type: String,
        required: true,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('review', reviewSchema);
