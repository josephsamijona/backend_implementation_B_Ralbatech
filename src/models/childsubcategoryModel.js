const { object } = require('joi');
const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const childsubcategory = new Schema({
    childsubcategory_name: {
        type: String
    },
    childsubcategory_slug: {
        type: String
    },
    category_id: 
    {
        type: Schema.Types.ObjectId,
        ref: 'category',
        default: null
    },
    subcategory_id: {
        type: Schema.Types.ObjectId,
        ref: 'subcategory',
        default: null
    },
    childsubcategory_image: {
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





module.exports = mongoose.model('childsubcategory', childsubcategory);