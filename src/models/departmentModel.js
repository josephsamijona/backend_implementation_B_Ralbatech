const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const department = new Schema({
    department_name: {
        type: String
    },
    department_slug: {
        type: String
    },
    department_image: {
        type: String
    },
    department_image_name: {
        type: String
    },
    department_store: {
        type: Schema.Types.ObjectId,
        ref: 'store'
    },
    // department_products: [ 
    //     { 
    //         type: Schema.Types.ObjectId,
    //         ref: 'products' 
    //     }
    // ],
    department_room: {
        type: Schema.Types.ObjectId,
        ref: 'roomelement',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('department', department);