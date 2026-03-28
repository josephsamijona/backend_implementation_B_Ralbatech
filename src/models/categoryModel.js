const { object } = require('joi');
const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const category = new Schema({
    category_name: {
        type: String
    },
    category_slug: {
        type: String
    },
   
     category_image: {
        type: String
    },
    category_image_name: {
        type: String
    },
    child_categories: 
    [
        Object
    ],
    addons: 
    [
        Object
    ],
    add_ons_json_name: {
        type: String
    },
    attributes: 
    [
        Object
    ],
    attributes_json_name: {
        type: String
    },
    status: {
        type: String,
        enum : ['active','inactive','deleted'],
        default: 'active'
    },
    createdAt :{
        type:Date,
        default:new Date()
      },
      updatedAt :{
        type:Date,
        default:""
      }
});

// Model

module.exports = mongoose.model('category', category);