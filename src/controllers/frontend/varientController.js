const response = require("../../libs/responseLib");

// Import Model
const Varient = require('../../models/varientModel');

const mongoose = require('mongoose');


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName varientList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let varientList = async (req, res)=>{

    try{
        let record = await Varient.find({status:'active'}).select({"_id": 1,"varient_name": 1,"varient_slug": 1,"varient_options": 1,"status": 1,"createdAt":1,"updatedAt":1});
        //console.log(record);

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
    * @functionName varientCreate
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let varientCreate = async (req, res) => {
    //return false;
    let newVarient = new Varient({
        varient_name: "Color",
        varient_slug:"color",
        varient_options: [{
            _id: mongoose.Types.ObjectId(),
            name: "White",
            desc: "#fff",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Black",
            desc: "#000",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Red",
            desc: "#c20000",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Green",
            desc: "#129900",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Yellow",
            desc: "#fcba03",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Blue",
            desc: "#0574eb",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Orange",
            desc: "#fc5603",
            status: "active"
        },{
            _id: mongoose.Types.ObjectId(),
            name: "Magenta",
            desc: "#9600a3",
            status: "active"
        }],
        status: "active"
    });
    await newVarient.save((err, newVarient) => {
        //console.log('success');
        let apiResponse = response.generate(0, ` Success`, newVarient);
        res.status(200);
        res.send(apiResponse);
    });
}


module.exports = {
    varientList:varientList,
    varientCreate:varientCreate,
}