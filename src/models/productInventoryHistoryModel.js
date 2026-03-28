const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const prodinventoryhistory = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
    },
    inventory_status: {
        type: String
    },
    stock: {
        type: Number
    },
    update_stock: {
        type: Number
    }
}, { timestamps: true });

// Model

module.exports = mongoose.model('prodinventoryhistory', prodinventoryhistory);