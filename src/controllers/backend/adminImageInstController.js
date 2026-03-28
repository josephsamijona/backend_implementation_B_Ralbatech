/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note:  Vendor store control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
// Import Model
const ImageInst = require('../../models/imageInstModel');
const mongoose = require('mongoose');


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName imageInstList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let imageInstList = async (req, res) => {
    try {
        let imageInstList = await ImageInst.find().lean();
        let apiResponse = response.generate(0, ` Success`, imageInstList);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName imageInstCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let imageInstCreate = async (req, res) => {

    let newimageIns = new ImageInst({
        image_instruction: req.body.image_instruction,
        page_image: req.body.page_image,
        image_size: req.body.image_size,
        image_width: req.body.image_width,
        image_height: req.body.image_height,
    });
    //console.log(newimageIns);
    try {
        await newimageIns.save();
        let imageInsDetails = {
            image_instruction: req.body.image_instruction,
            page_image: req.body.page_image,
            image_size: req.body.image_size,
            image_width: req.body.image_width,
            image_height: req.body.image_height,
        }
        // sendEmailRegistration(userDetails);
        let apiResponse = response.generate(0, ` Success`, imageInsDetails);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName imageInstDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let imageInstDetails = async (req, res) => {
    try {
        let record = await ImageInst.findOne({ _id: mongoose.Types.ObjectId(req.body.imageinst_id) }).lean();
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName imageInstUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let imageInstUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedImageinst = {};

        for (const property in reqbody) {
            updatedImageinst[property] = reqbody[property];
        }
        await ImageInst.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.Imageinst_id) }, updatedImageinst, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedImageinst);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}



module.exports = {
    imageInstList: imageInstList,
    imageInstCreate: imageInstCreate,
    imageInstDetails: imageInstDetails,
    imageInstUpdate: imageInstUpdate,
}