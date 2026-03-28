const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const room = new Schema({
    room_name: {
        type: String
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'vendor'
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    roomelement: {
        type: Schema.Types.ObjectId, // Rack, Table, Hanger
        ref: 'roomelement'
    },
    // roomelement_configaration: {
    //     type: Schema.Types.ObjectId, // Small, Large
    // },
    roomesize: {
        type: Schema.Types.ObjectId, // Small, Large
    },
    roomcount: {
        type: String
    },
    texture: {
        type: Array,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'deleted'],
        default: 'active'
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('room', room);