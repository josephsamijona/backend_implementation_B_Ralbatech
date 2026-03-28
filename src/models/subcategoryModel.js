const { object } = require('joi');
const mongoose = require('mongoose');

// Schema

const Schema = mongoose.Schema;
const subcategory = new Schema({
    subcategory_name: {
        type: String
    },
    subcategory_slug: {
        type: String
    },
    
   
    subcategory_image: {
        type: String
    },
    category_id: 
        {
            type: Schema.Types.ObjectId,
            ref: 'category',
            default: null
        }
    ,
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





module.exports = mongoose.model('subcategory', subcategory);