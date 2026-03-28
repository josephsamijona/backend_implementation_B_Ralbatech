const response = require("../../libs/responseLib");

// Import Model
const Category = require('../../models/categoryModel');
const mongoose = require('mongoose');

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by Md Mustakim Sarkar 
    * @function async
    * @functionName categoryList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let categoryList = async (req, res)=>{

    try{
        let record = await Category.find({status:'active'});
        
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    }catch (err) { 
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

let categoryCreate = async (req, res) => {
    
}

module.exports = {
    categoryList:categoryList,
    categoryCreate: categoryCreate
}