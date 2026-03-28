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
const Product = require('../../models/productModel');
const Homebanner = require('../../models/homeBannerModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const Store = require('../../models/storeModel');
const Department = require('../../models/departmentModel');
const { v4: uuidv4 } = require('uuid');


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerList = async (req, res) => {
    try {
        let record = await Homebanner.find({ "$or": [{ status: 'active' }, { status: 'inactive' }] });
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
    * @functionName uploadFiles
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadFiles = async (req, res) => {
    let file = req.files;
    let fileUrl = {
        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key
    }
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerDetails = async (req, res) => {
    try {
        let record = await Homebanner.findOne({ _id: mongoose.Types.ObjectId(req.body.banner_id) });
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
    * @functionName bannerUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedBanner = {};
        for (const property in reqbody) {
            updatedBanner[property] = reqbody[property];
        }
        await Homebanner.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.banner_id) }, updatedBanner, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedBanner);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerDelete = async (req, res) => {
    try {
        let updateBanner = {
            status: 'deleted'
        };
        //console.log(updateBanner)
        await Homebanner.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.banner_id) }, updateBanner, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateBanner);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerCreate = async (req, res) => {
    let newbanner = new Homebanner({
        banner_title: req.body.banner_title,
        banner_subtitle: req.body.banner_subtitle,
        banner_store: req.body.banner_store,
        banner_department: req.body.banner_department,
        banner_background_image: req.body.banner_background_image,
        banner_title_color: req.body.banner_title_color,
        banner_subtitle_color: req.body.banner_subtitle_color,
        banner_button_bg_color: req.body.banner_button_bg_color,
        banner_button_text_color: req.body.banner_button_text_color,
    });

    await newbanner.save((err, newbanner) => {
        //console.log('success');
        let apiResponse = response.generate(0, ` Success`, newbanner);
        res.status(200);
        res.send(apiResponse);
    });

}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerStoreList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerStoreList = async (req, res) => {
    let skip = 0;
    let limit = parseInt(req.body.limit);
    if (req.body.page > 1) {
        skip = req.body.page - 1 * limit;
    }
    try {
        let record = await Store.find({ status: 'active' }, null, { skip: skip, limit: limit }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean()
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
    * @functionName bannerDepartmentList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerDepartmentList = async (req, res) => {
    try {
        let storeList = await Store.find({ status: 'active', store_slug: req.body.store_slug }).lean();

        let departmentList = await Department.find({ status: 'active', department_store: { $in: storeList } }).populate('department_store', 'store_name status').lean();
        //console.log(results);
        let apiResponse = response.generate(0, ` Success`, departmentList);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}



module.exports = {
    bannerList: bannerList,
    uploadFiles: uploadFiles,
    bannerCreate: bannerCreate,
    bannerDetails: bannerDetails,
    bannerUpdate: bannerUpdate,
    bannerDelete: bannerDelete,
    bannerStoreList: bannerStoreList,
    bannerDepartmentList: bannerDepartmentList,
}