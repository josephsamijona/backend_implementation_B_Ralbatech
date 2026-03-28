const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const admin = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    admin_image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'role',
        default: null
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('admin', admin);