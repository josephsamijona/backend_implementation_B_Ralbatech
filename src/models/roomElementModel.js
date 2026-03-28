const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const roomelement = new Schema({
    roomelement_name: {
        type: String
    },
    roomelement_configaration: [
        {
            room_size : {
                type: Schema.Types.ObjectId,
                ref: 'roomsize',
            },
            max_count: {
                type: Number,
            }
        }
    ],
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('roomelement', roomelement);