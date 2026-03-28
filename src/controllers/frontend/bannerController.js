const response = require("../../libs/responseLib");

// Import Model
const Homebanner = require('../../models/homeBannerModel');
const Vendorbanner = require('../../models/vendorBannerModel');
const mongoose = require('mongoose');
const Product = require('../../models/productModel');
const Store = require('../../models/storeModel');
const genLib = require('../../libs/genLib');
const Vendor = require('../../models/vendorModel');
const Department = require('../../models/departmentModel');
const Room = require('../../models/roomModel');


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName homeBannerlist
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let homeBannerlist = async (req, res) => {

    try {
        let record = await Homebanner.find({ status: 'active' });

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
    * @functionName homeVendorBannerlist
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let homeVendorBannerlist = async (req, res) => {
    try {
        let storeList = await Store.find({ "$or": [{ status: 'active' }, { status: 'pending' }], store_slug: req.body.store_slug }).lean();
        if (storeList) {
            if (storeList[0].is_copy) {
                let record = await Vendorbanner.find({ status: 'active', vendor_id: storeList[0].main_vendor_id }).lean();
                let apiResponse = response.generate(0, ` Success`, record);
                res.status(200);
                res.send(apiResponse);
            }
            else {
                let record = await Vendorbanner.find({ status: 'active', vendor_id: storeList[0].store_owner }).lean();
                let apiResponse = response.generate(0, ` Success`, record);
                res.status(200);
                res.send(apiResponse);
            }

        } else {
            let apiResponse = response.generate(0, `No store banner found`, {});
            res.status(410);
            res.send(apiResponse);
        }

    } catch (err) {
        let apiResponse = response.generate(0, `No store banner found`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName allvendorlist
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let allvendorlist = async (req, res) => {

    try {
        let record = await Vendor.find({ status: 'active' }).select({ "_id": 1 });
        let apiResponse = response.generate(0, ` Success`, record.sort(() => Math.random() - 0.5));
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

module.exports = {
    homeBannerlist: homeBannerlist,
    homeVendorBannerlist: homeVendorBannerlist,
    allvendorlist: allvendorlist

}