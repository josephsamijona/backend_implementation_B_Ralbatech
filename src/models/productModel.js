const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const product = new Schema({
    product_sku: {
        type: String
    },
    product_name: {
        type: String
    },
    product_slug: {
        type: String
    },
    product_bg_color: {
        type: String
    },
    product_description: {
        type: String
    },
    product_external_link: {
        type: String,
        default: null
    },
    product_category: {
        // type: Schema.Types.ObjectId,
        // ref: 'category'
        type: String
    },
    product_sub_categories: {
        type: Array
    },
    product_brand: {
        type: Schema.Types.ObjectId,
        ref: 'brand'
    },
    product_owner: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    product_image: {
        type: Array
    },
    product_tryon_2d_image: {
        type: Array
    },
    product_3d_image: {
        type: Array
    },
    product_store_3d_image: {
        type: Array
    },
    product_tryon_3d_image: {
        type: Array
    },
    product_retail_price: {
        type: Number
    },
    product_sale_price: {
        type: Number
    },
    product_discount_price: {
        type: Number,
        default: 0.00
    },
    stock: {
        type: Number,
        default: 0
    },
    product_availability: {
        type: String
    },
    product_3dservice_status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    },
    attributes: {
        type: Array
    },
    add_ons: {
        type: Array
    },
    is_custom_addons: {
        type: Boolean
    },
    is_addons_required: {
        type: Boolean
    },
    copied_by_vendors: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    tags:{
        type: Array,
    },
    product_meta_tags:{
        type: Array,
    },
    displayer_fulfiller: [{
        vendor_id: {
            type: Schema.Types.ObjectId,
            ref: 'vendor',
            required: true
        },
        displayer_status: {
            type: String,
            enum: ['none', 'pending', 'active', 'inactive'],
            default: 'none'
        },
        fulfiller_status: {
            type: String,
            enum: ['none', 'pending', 'active', 'inactive'],
            default: 'none'
        },
        multi_vendor_support: {
            type: Boolean,
            default: true
            // false = ce fulfiller ne veut pas apparaître dans le modal "Choose vendor"
        },
        vendor_sales_price: {
            type: Number,
            default: null
        },
        mtg_id: {
            type: Schema.Types.ObjectId,
            ref: 'vendorMediaTextContent',
            default: null
            // MTG à afficher pour ce vendor dans le modal "Choose vendor"
        }
    }]

}, { timestamps: true });

// Model

module.exports = mongoose.model('product', product);