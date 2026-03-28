const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const payment = new Schema({
    transaction_id: {
        type: String,
    },
    country_code : {
        type: String,
    }, 
    email_address : {
        type: String,
    },
    name : {
        type: String,
    },
    customer_id_paypal : {
        type: String,
    },
    paypal_status : {
        type: String,
    },
    paypal_data : {
        type: Object,
    },

},{timestamps:true});

// Model

module.exports = mongoose.model('payment', payment);