const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const vendorProductAccess = new Schema({
    vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    main_vendor_id: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    field_name_edit: {
        type: String,
        enum: [
            'product_sku',
            'product_name',
            'product_slug',
            'product_bg_color',
            'product_description',
            'product_external_link',
            'product_category',
            'product_sub_categories',
            'product_brand',
            'product_owner',
            'product_image',
            'product_tryon_2d_image',
            'product_3d_image',
            'product_store_3d_image',
            'product_tryon_3d_image',
            'product_retail_price',
            'product_sale_price',
            'product_discount_price',
            'stock',
            'product_availability',
            'product_3dservice_status',
            'attributes',
            'add_ons',
            'is_custom_addons',
            'is_addons_required',
            'copied_by_vendors',
            'tags'
        ]
    },
    field_new_value:
    {
        type: Array
    },
    field_old_value:
    {
        type: Array
    },
    vendor_approve:
    {
        type: Boolean,
        default: false
    },
    admin_approve:
    {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'deleted'],
        default: 'pending'
    },
}, { timestamps: true });

// Model

module.exports = mongoose.model('vendorProductAccess', vendorProductAccess);