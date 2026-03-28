const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const store = new Schema({
    store_name: {
        type: String
    },
    store_slug: {
        type: String,
    },
    store_description: {
        type: String
    },
    store_location: {
        type: String
    },
    domain_name: {
        type: String
    },
    store_owner: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    store_department: [{
        type: Schema.Types.ObjectId,
        ref: 'department',
        default: null
    }],
    store_jpg_file: {
        type: String
    },
    store_jpg_file_name: {
        type: String
    },
    store_glb_file: {
        type: String
    },
    store_glb_file_name: {
        type: String
    },
    store_json_file_name: {
        type: String
    },
    store_products: {
        type: Array
    },
    is_logo: {
        type: Boolean
    },
    logo_name: {
        type: String
    },
    logo: {
        type: String
    },
    logo_file_name: {
        type: String
    },
    is_copy:
    {
        type: Boolean,
        default: false
    },
    main_vendor_id:
    {
        type: String,
        default:''
    },
    main_store_id:
    {
        type: String,
        default:''
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('store', store);