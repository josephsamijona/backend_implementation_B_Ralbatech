const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const varient = new Schema({
    varient_name: {
        type: String
    },
    varient_slug: {
        type: String
    },
    varient_options: {
        type: Array
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('varient', varient);