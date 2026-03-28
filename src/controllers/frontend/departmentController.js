const response = require("../../libs/responseLib");

// Import Model
const Department = require('../../models/departmentModel');
const mongoose = require('mongoose');


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName departmentList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentList = async (req, res)=>{

    try{
        let record = await Department.find({status:'active'});
        
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    }catch (err) { 
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName departmentDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentDetails = async (req, res) => {
    try{
        let department_slug = req.body.department_slug;

        let record = await Department.aggregate([
            { $match: { $and: [{ "department_slug":department_slug},{ "status":'active'} ]} },

            {
                $lookup: {
                    from: "stores",
                    localField: "department_store",
                    foreignField: "_id",
                    as: "department_store",
                }
            },
            {$unwind: '$department_store'},
            {
                $project: {

                    "_id" : 1,
                    "department_name" : 1,
                    "department_slug" : 1,
                    "department_image" : 1,
                    "department_store" : 1,
                    "product_store._id":1,
                    "product_store.store_name":1,
                    "product_store.store_slug":1,
                    "product_store.store_image":1,
                    "product_store.store_location":1,
                    "department_room" : 1,
                    "department_room" : 1,
                    "status" : 1,
                    "createdAt" :1,
                    "updatedAt" : 1,

                }
            }
        ]);
        
        if(record.length > 0){
            record = record[0]
        }else{
            record = {}
        }

        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    }catch (err) { 
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

module.exports = {
    departmentList:departmentList,
    departmentDetails: departmentDetails
}