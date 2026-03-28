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
const Store = require('../../models/storeModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const checkLib = require("../../libs/checkLib");
const crypto = require("../../libs/passwordLib");
const JWT = require('../../libs/tokenLib');
const Vendor = require('../../models/vendorModel');
const Admin = require('../../models/adminModel');
/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName storeList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeList = async (req, res) => {
    let skip = 0;
    let limit = parseInt(req.body.limit);
    if (req.body.page > 1) {
        skip = req.body.page - 1 * limit;
    }
    try {
        let record = await Store.find({ store_owner: mongoose.Types.ObjectId(req.body.vendor_id), "$or": [{ status: 'active' }, { status: 'pending' }] }, null, { skip: skip, limit: limit }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();

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
    //console.log(fileUrl);
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName storeDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeDetails = async (req, res) => {
    try {
        let record = await Store.findOne({ _id: mongoose.Types.ObjectId(req.body.store_id) }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
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
    * @functionName storeUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedStore = {};
        if (req.body.store_name) {
            let storeslug_final = '';
            let storeslug = genLib.createSlug(req.body.store_name);
            let count_find_store = await Store.countDocuments({ "store_slug": { $regex: '.*' + storeslug + '.*' } })
            let storedetail = await Store.find({ _id: mongoose.Types.ObjectId(req.body.store_id) }).lean();

            if (storedetail[0].store_name == req.body.store_name) {
                storeslug_final = storedetail[0].store_slug
            } else {
                storeslug_final = (count_find_store > 0) ? storeslug + '-' + (count_find_store + 1) : storeslug
            }

            updatedStore = {
                store_slug: storeslug_final,
                store_location: req.body.store_location,
                domain_name: req.body.domain_name,
                store_products: req.body.store_products,
            };
        }

        for (const property in reqbody) {
            updatedStore[property] = reqbody[property];
        }

        // ststus change all access vendor associated with main store
        if (req.body.status) {
            updatedaccessStore =
            {
                status: req.body.status
            }

            await Store.updateMany({ main_store_id: req.body.store_id }, updatedaccessStore, { new: true });
        }
        await Store.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.store_id) }, updatedStore, { new: true });

        let apiResponse = response.generate(0, ` Success`, updatedStore);
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
    * @functionName storeDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeDelete = async (req, res) => {
    try {
        let updateStore = {
            status: 'deleted'
        };

        await Store.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.store_id), store_owner: mongoose.Types.ObjectId(req.body.store_owner_id) }, updateStore, { new: true });
        await Product.updateMany({ product_owner: mongoose.Types.ObjectId(req.body.store_owner_id) }, updateStore, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateStore);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendoradminLogin
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendoradminLogin = async (req, res) => {
    try {
        let verify_pass = await crypto.verify(req.body.password, req.body.record.password);
        if (verify_pass) {
            let resObj = {
                user_id: req.body.record._id,
                name: req.body.record.name,
                email: req.body.record.email,
            }
            let token = await JWT.generateToken(resObj);
            resObj.token = token;
            let apiResponse = response.generate(0, ` Success`, resObj);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(0, ` Wrong Password`, {});
            res.status(410);
            res.send(apiResponse)
        }
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorAdminDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorAdminDetails = async (req, res) => {
    try {
        let record = await Admin.findOne({
            email: req.user.email
        }).lean();
        if (checkLib.isEmpty(record)) {
            record = await Vendor.findOne({
                email: req.user.email
            }).lean();
        }
        if (checkLib.isEmpty(record)) {
            throw new Error('User Data Not Found');
        }
        else {
            let apiResponse = response.generate(0, ` Success`, record);
            res.status(200);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


module.exports = {
    storeList: storeList,
    uploadFiles: uploadFiles,
    storeDetails: storeDetails,
    storeUpdate: storeUpdate,
    storeDelete: storeDelete,
    vendoradminLogin: vendoradminLogin,
    vendorAdminDetails: vendorAdminDetails
}