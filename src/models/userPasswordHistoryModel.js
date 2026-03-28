const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const userpasswordhistory = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    previous_password: {
        type: String
    }
},{timestamps:true});

// Model

module.exports = mongoose.model('userpasswordhistory', userpasswordhistory);