const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const adminmodule = new Schema({
    module_id: {
        type: Schema.Types.ObjectId
    },
    subadmin_id: {
        type: Schema.Types.ObjectId,
        ref: 'admins'
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'deleted'],
        default: 'active'
    },
}, { timestamps: true });

// Model

module.exports = mongoose.model('adminmodule', adminmodule);