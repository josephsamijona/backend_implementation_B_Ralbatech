const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const roomtexturemaster = new Schema({
    texture_images: [{
        front: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
        right: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
        back: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
        left: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
        top: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
        floor: [
            {
                image: String,
                image_3d: String,
                status: String,
            }
        ],
    }],
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('roomtexturemaster', roomtexturemaster);