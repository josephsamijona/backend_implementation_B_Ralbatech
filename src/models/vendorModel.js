const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const vendor = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    vendor_image: {
        type: String,
        default: ''
    },
    vendor_type: {
        type: String,
        enum: ['main', 'access', 'assets'],
        default: 'main'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    },
    stores: [{
        type: Schema.Types.ObjectId,
        ref: 'store'
    }],
    is_copy:
    {
        type: Boolean,
        default: false
    },
    main_vendor_id:
    {
        type: String
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('vendor', vendor);