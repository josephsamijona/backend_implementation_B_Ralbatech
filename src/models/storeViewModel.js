const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const storeviews = new Schema({
    store_id: {
        type: Schema.Types.ObjectId,
    },
    vendor_id: {
        type: Schema.Types.ObjectId,
    },
    store_view_date: {
        type: Date
    },

}, { timestamps: true });

// Model

module.exports = mongoose.model('storeviews', storeviews);