 const response = require("../../libs/responseLib");
const adminSetting = require('../../models/adminSettingsModel')
// Import Model
const Product = require('../../models/productModel');
const Varient = require('../../models/varientModel');
const Department = require('../../models/departmentModel');
const Category = require('../../models/categoryModel');
const mongoose = require('mongoose');
const { object } = require("joi");
const commonLib = require("../../libs/commonLib");
const addonModel = require("../../models/addonModel");
const Store = require("../../models/storeModel")
const checkLib = require("../../libs/checkLib");
const categoryModel = require("../../models/categoryModel");
// added to take tag into account in product filtering
const Tag = require('../../models/tagModel');

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName productList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productList = async (req, res) => {

    let category_slug = req.body.category;

    try {

        let category_id = '';
        let record = new Array();
        let category = await Category.findOne({ category_slug: category_slug }, { _id: 1 }).lean();
        if (category) {
            category_id = category._id;


            record = await Product.aggregate([
                { $match: { $and: [{ "product_category": mongoose.Types.ObjectId(category_id) }, { "status": 'active' }] } },

                {
                    $lookup: {
                        from: "categories",
                        localField: "product_category",
                        foreignField: "_id",
                        as: "product_category",
                    }
                },
                { $unwind: '$product_category' },
                {
                    $lookup: {
                        from: "vendors",
                        localField: "product_owner",
                        foreignField: "_id",
                        as: "product_owner",
                    }
                },
                { $unwind: '$product_owner' },

                {
                    "$project": {
                        "_id": 1,
                        "product_sku": 1,
                        "product_name": 1,
                        "product_slug": 1,
                        "product_external_link": 1,
                        "product_description": 1,
                        "product_bg_color": 1,
                        "product_category._id": 1,
                        "product_category.category_name": 1,
                        "product_category.category_slug": 1,
                        "product_category.status": 1,

                        "product_owner._id": 1,
                        "product_owner.name": 1,

                        "product_image": 1,
                        "product_tryon_2d_image": 1,
                        "product_3d_image": 1,
                        "product_store_3d_image": 1,
                        "product_tryon_3d_image": 1,
                        "product_retail_price": 1,
                        "product_sale_price": 1,
                        "product_availability": 1,
                        "product_3dservice_status": 1,
                        "product_meta_tags": 1,
                        "stock": 1,
                        "width": 1,
                        "height": 1,
                        "tags": 1,
                        "status": 1,
                        "createdAt": 1,
                        "updatedAt": 1

                    }
                }

            ]);
        }

        if (record.length > 0) {
            for (const element of record) {
                if (element.product_availibility == 'YES') {
                    element.product_availibility = 1
                } else {
                    element.product_availibility = 0
                    element.stock = 0;
                }
            }
        }
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
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
    * @functionName productDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productDetails = async (req, res) => {

    let product_slug = req.params.slug;
    try {
        let record = await Product.aggregate([
            { $match: { $and: [{ "product_slug": product_slug }, { status: 'active' }] } },
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },
            { $unwind: '$product_owner' },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_external_link": 1,
                    "product_description": 1,
                    "product_category": 1,
                    "product_bg_color": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,

                    "attributes": 1,
                    "add_ons": 1,

                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "status": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1

                }
            }
        ]);

        if (record.length > 0) {
            record = record[0];
            let categoryDetails;
            if (record.product_availability == 'YES') {
                record.product_availability = 1
            } else {
                record.product_availibility = 0
                record.stock = 0;
            }
            record.product_category = record.product_category.toString();
            if (Buffer.from(record.product_category).length == 12 || Buffer.from(record.product_category).length == 24) {
                categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(record.product_category) });
                record.product_category_id = record.product_category;
                record.product_category_name = categoryDetails.category_name;
                delete record.product_category;
            } else {
                categoryDetails = await Category.find();
                categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', record.product_category);
                record.product_category_id = record.product_category;
                record.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', record.product_category).category_name;
                delete record.product_category;

            }
            //console.log(categoryDetails._id)
            let id = categoryDetails._id.toString();
            if (record.is_addons_required == true && (record.is_custom_addons == false || record.is_custom_addons == null)) {
                let add_ons_data = await addonModel.findOne({ $and: [{ product_category_id: id }, { vendor_id: mongoose.Types.ObjectId(record.product_owner._id) }] });
                if (add_ons_data)
                    record.add_ons = add_ons_data.add_ons;
            }

        } else {
            record = {}
        }


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
    * @Modified_by 
    * @function async
    * @functionName capitalizeFirstLetter
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
function capitalizeFirstLetter(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
    * @author Munnaf Hoss' Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName regexp
    * @functionPurpose  
    *                                                  
    * @functionParam params
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
function regexp(params) {
    let str = `^${params}`;
    //console.log('str', str);
    let re = new RegExp(str);
    //console.log('re', typeof (re));
    return re;
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName productSearch
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productSearch = async (req, res) => {
    try {
        let searchString = req.body.searchkey;
        let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }
        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;

        let record;
        if (searchString.length >= 2) {
            record = await Product.aggregate([
                {
                    $match: {
                        $and: [
                            {
                                $or: [
                                    { product_slug: { $regex: searchString, $options: "i" } },  // Case-insensitive regex for slug
                                    { product_name: { $regex: searchString, $options: "i" } }  // Case-insensitive regex for name
                                ]
                            },
                            { status: 'active' },
                            {
                                product_owner: mongoose.Types.ObjectId(vendor_id)   // Only fetch products for this vendor
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "vendors",
                        localField: "product_owner",
                        foreignField: "_id",
                        as: "product_owner",
                    }
                },
                { $unwind: '$product_owner' },
                {
                    $lookup: {
                        from: "brands",
                        localField: "product_brand",
                        foreignField: "_id",
                        as: "product_brand",
                    }
                },
                { $unwind: '$product_brand' },
                {
                    $project: {
                        "_id": 1,
                        "product_sku": 1,
                        "product_name": 1,
                        "product_slug": 1,
                        "product_description": 1,
                        "product_bg_color": 1,
                        "product_external_link": 1,
                        "product_category": 1,
                        "product_sub_categories": 1,
                        "product_owner._id": 1,
                        "product_owner.name": 1,
                        "product_brand._id": 1,
                        "product_brand.brand_name": 1,
                        "product_image": 1,
                        "product_tryon_2d_image": 1,
                        "product_3d_image": 1,
                        "product_store_3d_image": 1,
                        "product_tryon_3d_image": 1,
                        "product_retail_price": 1,
                        "product_sale_price": 1,
                        "product_availability": 1,
                        "product_3dservice_status": 1,
                        "product_meta_tags": 1,
                        "stock": 1,
                        "status": 1,
                        "attributes": 1,
                        "add_ons": 1,
                        "is_addons_required": 1,
                        "is_custom_addons": 1,
                        "copied_by_vendors": 1,
                        "tags": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                },
            ]);
        } else {
            throw new Error('Search string must be at least 2 characters long.');
        }
        let totalRecords = 0;
        if (record.length > 0) {
            totalRecords = record.length;
            let categoryIds = record.map(element => element.product_category.toString());
            let categoryDetailsMap = {};

            if (categoryIds.length) {
                let categories = await Category.find({ _id: { $in: categoryIds } }).select('_id category_name').lean();
                categories.forEach(category => {
                    categoryDetailsMap[category._id] = category.category_name;
                });
            }

            record.forEach(element => {
                let categoryId = element.product_category.toString();
                element.product_category_id = categoryId;
                element.product_category_name = categoryDetailsMap[categoryId] || "";
                delete element.product_category;
            });
        } else {
            record = {};
        }

        let apiResponse = response.generate(0, `Success`, record);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
}
/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName settingsDetaild
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let settingsDetaild = async (req, res) => {
    try {
        let record = await adminSetting.find({ status: 'active' }).lean();
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
    * @Modified_by 
    * @function async
    * @functionName allproductSearch
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let allproductSearch = async (req, res) => {

    let searchkey = (req.body.searchkey).toLowerCase();

    try {

        let record = await Product.aggregate([

            {
                $match: {
                    $or: [{
                        "$and": [{ status: 'active' }]
                    }],
                    stock: { $gt: 0 } // Ensure only products with stock > 0 are counted
                }
            },

            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },


            { $unwind: '$product_owner' },

            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_external_link": 1,
                    "product_description": 1,

                    "product_category": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,

                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "width": 1,
                    "height": 1,
                    "status": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1

                }
            }
        ]);
        let searchResult;
        let apiResponse;
        if (record.length > 0) {
            if (record.product_availibility == 'YES') {
                record.product_availibility = 1
            } else {
                record.product_availibility = 0
                record.stock = 0;
            }
            searchResult = record.reduce((acc, curr) => {
                let searchStr = '';
                searchStr += (curr.product_name + ' ' + curr.product_category.category_name).toLowerCase();

                if (searchStr.includes(searchkey)) {
                    acc.push(curr);
                }
                return acc;
            }, []);

            apiResponse = response.generate(0, ` Success`, searchResult);
        } else {
            record = {}
            apiResponse = response.generate(0, ` Success`, record);
        }


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
    * @Modified_by 
    * @function async
    * @functionName filterStoreProduct
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let filterStoreProduct = async (req, res) => {
    let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
    try {
        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }
        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;
        let record;
        let page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.body.limit) || 9; // Default to 9 items per page if not provided
        let skip = (page - 1) * limit; // Calculate how many records to skip

        const matchConditions = {
            "status": 'active',
            "product_owner": mongoose.Types.ObjectId(vendor_id)
        };

        if (req.body.brand) {
            matchConditions.product_brand = mongoose.Types.ObjectId(req.body.brand);
        }

        // Check if product_category is provided
        if (req.body.product_category) {
            matchConditions.product_sub_categories = {
                $elemMatch: {
                    child_category_id: req.body.product_category
                }
            };
        }

        record = await Product.aggregate([
            {
                $match: matchConditions,
                stock: { $gt: 0 } // Ensure only products with stock > 0 are counted
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },
            { $unwind: '$product_owner' },
            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "product_brand",
                }
            },
            { $unwind: '$product_brand' },
            {
                $match: {
                    "product_3d_image": {
                        $elemMatch: {
                            "pro_3d_image": { $exists: true, $ne: "" }
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_description": 1,
                    "product_external_link": 1,
                    "product_category": 1,
                    "product_sub_categories": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,
                    "product_brand._id": 1,
                    "product_brand.brand_name": 1,
                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "status": 1,
                    "attributes": 1,
                    "add_ons": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            { $skip: skip }, // Skip records for pagination
            { $limit: limit } // Limit the number of records returned
        ]);


        // Get the total count of 3D products matching the conditions
        let total3DCount = await Product.aggregate([
            {
                $match: matchConditions,
                stock: { $gt: 0 } // Ensure only products with stock > 0 are counted
            },
            {
                $match: {
                    "product_3d_image": {
                        $elemMatch: {
                            "pro_3d_image": { $exists: true, $ne: "" }
                        }
                    }
                }
            },
            {
                $count: "total"
            }
        ]);

        // If the aggregation result is empty, set total3DCount to 0; otherwise, get the count
        let totalCount = total3DCount.length > 0 ? total3DCount[0].total : 0;

        let apiResponse;
        if (record.length > 0) {
            apiResponse = response.generate(0, `Success`, { products: record, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) });
        } else {
            apiResponse = response.generate(0, `Success`, {});
        }

        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};




/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName homefilterStoreProduct
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let homefilterStoreProduct = async (req, res) => {

    let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
    try {
        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }
        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;
        // console.log('store_details -------------------', store_details, vendor_id)
        let record = await Product.aggregate([

            {
                $match: {
                    "status": 'active',
                    "product_owner": mongoose.Types.ObjectId(vendor_id),
                    stock: { $gt: 0 } // Ensure only products with stock > 0 are counted
                }
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },


            { $unwind: '$product_owner' },

            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "product_brand",
                }
            },
            { $unwind: '$product_brand' },
            {
                $match: {
                    "product_3d_image": {
                        $elemMatch: {
                            "pro_3d_image": { $exists: true, $ne: "" }
                        }
                    }
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_description": 1,
                    "product_external_link": 1,
                    "product_category": 1,
                    "product_sub_categories": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,
                    "product_brand._id": 1,
                    "product_brand.brand_name": 1,
                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "status": 1,
                    "attributes": 1,
                    "add_ons": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1

                }
            }
        ]);

        let apiResponse;
        if (record.length > 0) {
            apiResponse = response.generate(0, `Success`, record);
        } else {
            record = {}
            apiResponse = response.generate(0, ` Success`, record);
        }


        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

let findCategoryIdBySlug = (categoryObj, targetSlug) => {
    if (categoryObj.category_slug == targetSlug) {
        // //console.log('categoryObj===',categoryObj);
        if (categoryObj._id) {
            return categoryObj._id;
        }
        else {
            return categoryObj.category_id;
        }

    }

    for (let childCategory of categoryObj.child_categories) {
        let result = findCategoryIdBySlug(childCategory, targetSlug);
        if (result !== null) {
            return result;
        }
    }

    return null;
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName filter2dStoreProduct
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let filterContactProduct = async (req, res) => {
    let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
    try {
        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }

        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;
        let record;
        let page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.body.limit) || 9; // Default to 9 items per page if not provided
        let skip = (page - 1) * limit; // Calculate how many records to skip

        const matchConditions = {
            "status": 'active',
            "product_owner": mongoose.Types.ObjectId(vendor_id)
        };

        if (req.body.brand) {
            matchConditions.product_brand = mongoose.Types.ObjectId(req.body.brand);
        }

        // let contact_lens_Category = await categoryModel.findOne({ category_slug: 'contact' }).lean();

        // // Check if product_category is provided
        // if (!checkLib.isEmpty(contact_lens_Category)) {
        //     matchConditions.product_sub_categories = {
        //         $elemMatch: {
        //             child_category_id: contact_lens_Category.child_categories[0].category_id
        //         }
        //     };
        // }
          let child_categories_set = await categoryModel.find({ category_slug: /^contact/ }, { child_categories: 1 }).lean();
      
        const category_ids = child_categories_set.flatMap(item => item.child_categories.map(c => c.category_id));
       
        if (category_ids && category_ids.length > 0) {
         
            matchConditions.product_sub_categories = {
                $elemMatch: {
                    child_category_id: { $in: category_ids }
                }
            };
        }
         else {
            throw new Error('Contact category not found')
        }
        // console.log('matchConditions-----------', matchConditions);
        record = await Product.aggregate([
            {
                $match: {
                    ...matchConditions,
                    stock: { $gt: 0 }
                }

            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },
            { $unwind: '$product_owner' },
            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "product_brand",
                }
            },
            { $unwind: '$product_brand' },
            {
                // Match products without valid 3D images
                $match: {
                    $or: [
                        { "product_3d_image": { $exists: false } }, // No 3D image field
                        {
                            "product_3d_image": {
                                $elemMatch: {
                                    "pro_3d_image": { $eq: "" }, // 3D image is empty
                                    "_id": { $eq: "" }, // ID is empty
                                    "pro_3d_image_name": { $eq: "" }, // Name is empty
                                    "status": "active" // Ensure status is active
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_description": 1,
                    "product_external_link": 1,
                    "product_category": 1,
                    "product_sub_categories": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,
                    "product_brand._id": 1,
                    "product_brand.brand_name": 1,
                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "status": 1,
                    "attributes": 1,
                    "add_ons": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            { $skip: skip }, // Skip records for pagination
            { $limit: limit } // Limit the number of records returned
        ]);

        // Get the total count of 3D products matching the conditions
        let total3DCount = await Product.aggregate([
            {
                $match: {
                    ...matchConditions,
                    stock: { $gt: 0 }
                }
            },
            {
                // Match products without valid 3D images
                $match: {
                    $or: [
                        { "product_3d_image": { $exists: false } }, // No 3D image field
                        {
                            "product_3d_image": {
                                $elemMatch: {
                                    "pro_3d_image": { $eq: "" }, // 3D image is empty
                                    "_id": { $eq: "" }, // ID is empty
                                    "pro_3d_image_name": { $eq: "" }, // Name is empty
                                    "status": "active" // Ensure status is active
                                }
                            }
                        }
                    ]
                }
            },
            {
                $count: "total"
            }
        ]);

        // If the aggregation result is empty, set total3DCount to 0; otherwise, get the count
        let totalCount = total3DCount.length > 0 ? total3DCount[0].total : 0;

        let apiResponse;
        if (record.length > 0) {
            apiResponse = response.generate(0, `Success`, { products: record, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) });
        } else {
            apiResponse = response.generate(0, `Success`, {});
        }

        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName filterAllStoreProduct
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let filterAllStoreProduct = async (req, res) => {
    let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
    //console.log('req.body-----------', req.body);
    try {
        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }
        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;
        let record;
        let page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.body.limit) || 12; // Default to 9 items per page if not provided
        let skip = (page - 1) * limit; // Calculate how many records to skip

        //tag id generated to filter a particular tag category
        let tagname = '';
        let newtagid = '';

        const matchConditions = {
            "status": 'active',
            "product_owner": mongoose.Types.ObjectId(vendor_id)
        };

        if (req.body.brand) {
            matchConditions.product_brand = mongoose.Types.ObjectId(req.body.brand);
        }

        // Check if product_category is provided
        if (req.body.product_category) {
            let eye_glass_Categories = await categoryModel.find({ category_slug: { $regex: 'eyeglass', $options: 'i' } }).lean();
            let subCategoryIds = [];

            if (eye_glass_Categories && eye_glass_Categories.length > 0) {
                eye_glass_Categories.forEach(category => {
                    if (category.child_categories && category.child_categories.length > 0) {
                        let matchingSubs = category.child_categories.filter(sub => sub.category_slug === req.body.product_category);
                        matchingSubs.forEach(sub => {
                            if (sub.category_id) {
                                subCategoryIds.push(sub.category_id);
                            } else if (sub._id) {
                                subCategoryIds.push(sub._id);
                            }
                        });
                    }
                });
            }
           //console.log('subCategoryIds..........', subCategoryIds);
           if (subCategoryIds.length > 0) {
                matchConditions.product_sub_categories = {
                    $elemMatch: {
                        child_category_id: { $in: subCategoryIds }
                    }
                };
            } else {
                matchConditions.product_sub_categories = {
                    $elemMatch: {
                        child_category_id: req.body.product_category
                    }
                };
            }

           //Infer search tag from product_category and received tag.
           // Men Eyeglasses (or the other categories) is reserved to EighttoEighty.
           // For the other brands and types, we will define new tags and special categories to differentiate them.
           // For instance sunglasses will be tag with 'Sunglasses'. An additional tag 'Men Sunglasses' will be used
           // to filter Men sunglasses. 
           // This tagging scheme will be used for all other brands or groups.
            const categoryName = capitalizeFirstLetter(req.body.product_category);
           
           tagname = categoryName + " Eyeglasses";
           try {
              const tags = await Tag.find({ _id: { $in: req.body.tag_ids } }).select("tag_name");
              if (tags[0].tag_name != 'EightToEighty Eyeglasses' && tags[0].tag_name != 'New Arrivals' && 
                  tags[0].tag_name != 'Men Eyeglasses' && tags[0].tag_name != 'Women Eyeglasses' && 
                  tags[0].tag_name != 'Unisex Eyeglasses'){
                 tagname = `${categoryName} ${tags[0].tag_name}`.trim();
                 const newtags = await Tag.find({ tag_name: tagname }).select("_id");
                 newtagid = newtags[0]?._id.toString();
              }
              else{
              }
           } catch (err) {
              console.log("error creating new tag");
           }
           //console.log('tagname.....', tagname);
            matchConditions.tags = {
                $elemMatch: {
                    tag_name: tagname
                }
            };
        }
        else {
            // let eye_glass_Category = await categoryModel.findOne({ category_slug: 'eyeglass' }).lean();
            // // Check if product_category is not provided
            // if (!checkLib.isEmpty(eye_glass_Category)) {
            //     matchConditions.product_category = (eye_glass_Category._id).toString();
            // }

            let child_categories_set = await categoryModel.find({ category_slug: /^eyeglass/ }, { child_categories: 1 }).lean();
            const category_ids = child_categories_set.flatMap(item => item.child_categories.map(c => c.category_id));
            if (category_ids && category_ids.length > 0) {
                matchConditions.product_sub_categories = {
                    $elemMatch: {
                        child_category_id: { $in: category_ids }
                    }
                };
            }
        }

        // Tag filters: prefer multiple tag_ids if provided; otherwise fall back to single tag_id
        if (Array.isArray(req.body.tag_ids) && req.body.tag_ids.length > 0) {
            // Remove empty/falsy IDs so payloads like [""] are ignored safely
            const tagIds = req.body.tag_ids.filter(id => id && String(id).trim().length > 0);
           //append the newly generated tagname to the tagIds list received
            if (tagIds.length > 0) {
               if (newtagid != '' && newtagid != null)
                  tagIds.push(newtagid);
                // Match any product whose tags contain any of the provided tag IDs
                matchConditions["tags._id"] = { $in: tagIds };
            }
        } else if (req.body.tag_id) {
            matchConditions.tags = {
                $elemMatch: {
                    _id: req.body.tag_id
                }
            };
        }

       if(tagname != '' && tagname != null )
          delete matchConditions.product_sub_categories;
       if(tagname == "Unisex Eyeglasses")
          delete matchConditions['tags._id'];
       //strangely for the tag._id corresponding to Unisex Eyeglasses the matchCondtions for tags._id does not work
       if (req.body.tag_ids[0] == '6806a7ccfc44e2f2a16d484f' && (req.body.product_category=='' || req.body.product_category=='unisex')){
          delete matchConditions['tags._id'];
          matchConditions.tags = { $elemMatch: { tag_name: "Unisex Eyeglasses" } };         
       }
       //console.log('matchConditions.....', matchConditions);

        record = await Product.aggregate([
            {
                $match: {
                    ...matchConditions,
                    stock: { $gt: 0 } // Ensure only products with stock > 0 are included
                }
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },
            { $unwind: '$product_owner' },
            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "product_brand",
                }
            },
            { $unwind: '$product_brand' },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_description": 1,
                    "product_external_link": 1,
                    "product_category": 1,
                    "product_sub_categories": 1,
                    "product_owner._id": 1,
                    "product_owner.name": 1,
                    "product_brand._id": 1,
                    "product_brand.brand_name": 1,
                    "product_image": 1,
                    "product_tryon_2d_image": 1,
                    "product_3d_image": 1,
                    "product_store_3d_image": 1,
                    "product_tryon_3d_image": 1,
                    "product_retail_price": 1,
                    "product_sale_price": 1,
                    "product_availability": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "stock": 1,
                    "status": 1,
                    "attributes": 1,
                    "add_ons": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            { $skip: skip }, // Skip records for pagination
            { $limit: limit } // Limit the number of records returned
        ]);

        // Get the total count of 3D products with stock > 0
        let total2D3DCount = await Product.aggregate([
            {
                $match: {
                    ...matchConditions,
                    stock: { $gt: 0 } // Ensure only products with stock > 0 are counted
                }
            },
            { $count: "total" }
        ]);


        // If the aggregation result is empty, set total2D3DCount to 0; otherwise, get the count
        let totalCount = total2D3DCount.length > 0 ? total2D3DCount[0].total : 0;
        // console.log('Total Product Filter Query:', JSON.stringify({ ...matchConditions, stock: { $gt: 0 } }, null, 2));
        // console.log('Total Products Found:', totalCount);

        let apiResponse;
        if (record.length > 0) {
            apiResponse = response.generate(0, `Success`, { products: record, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) });
        } else {
            apiResponse = response.generate(0, `Success`, {});
        }

        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};



/**
 * getPlatformAllProducts
 * Liste tous les produits de la plateforme (vue vendor)
 * Inclut les champs displayer/fulfiller pour le vendor authentifié
 */
let getPlatformAllProducts = async (req, res) => {
    try {
        let vendor_id = req.body.vendor_id;
        let page = req.body.page ? parseInt(req.body.page) : 1;
        let limit = req.body.limit ? parseInt(req.body.limit) : 20;

        if (checkLib.isEmpty(vendor_id)) {
            return res.status(400).send(response.generate(1, 'vendor_id is required', {}));
        }

        let totalCount = await Product.countDocuments({ status: 'active' });

        let products = await Product.find({ status: 'active' })
            .populate('product_owner', 'name')
            .populate('product_brand', 'brand_name')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        // Enrichir chaque produit avec les infos displayer/fulfiller du vendor
        for (let product of products) {
            let is_owner = product.product_owner && product.product_owner._id.toString() === vendor_id;
            let df_entry = product.displayer_fulfiller
                ? product.displayer_fulfiller.find(e => e.vendor_id && e.vendor_id.toString() === vendor_id)
                : null;

            product.is_owner = is_owner;
            product.vendor_displayer_status = df_entry ? df_entry.displayer_status : 'none';
            product.vendor_fulfiller_status = df_entry ? df_entry.fulfiller_status : 'none';
            product.vendor_sales_price = df_entry ? df_entry.vendor_sales_price : null;
            product.vendor_multi_vendor_support = df_entry ? df_entry.multi_vendor_support : true;
            product.df_pending = df_entry
                ? (df_entry.displayer_status === 'pending' || df_entry.fulfiller_status === 'pending')
                : false;
        }

        let apiResponse = response.generate(0, 'Success', {
            products,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * updateDisplayerFulfiller
 * Met à jour le statut displayer/fulfiller d'un vendor pour un produit
 */
let updateDisplayerFulfiller = async (req, res) => {
    try {
        let product_id = req.params.product_id;
        let { vendor_id, displayer_status, fulfiller_status, vendor_sales_price, multi_vendor_support } = req.body;

        if (checkLib.isEmpty(vendor_id)) {
            return res.status(400).send(response.generate(1, 'vendor_id is required', {}));
        }

        let product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).send(response.generate(1, 'Product not found', {}));
        }

        // Validation: vendor_sales_price requis si fulfiller_status !== 'none'
        if (fulfiller_status && fulfiller_status !== 'none' && (vendor_sales_price === null || vendor_sales_price === undefined)) {
            return res.status(400).send(response.generate(1, 'vendor_sales_price is required when fulfiller_status is set', {}));
        }

        let is_owner = product.product_owner && product.product_owner.toString() === vendor_id;

        // Forcer le statut à 'pending' — un vendor ne peut jamais s'auto-approuver
        let safeDisplayerStatus = displayer_status && displayer_status !== 'none' ? 'pending' : (displayer_status || 'none');
        let safeFulfillerStatus = fulfiller_status && fulfiller_status !== 'none' ? 'pending' : (fulfiller_status || 'none');

        // Chercher entrée existante
        let existingIndex = product.displayer_fulfiller
            ? product.displayer_fulfiller.findIndex(e => e.vendor_id && e.vendor_id.toString() === vendor_id)
            : -1;

        if (existingIndex >= 0) {
            // Mettre à jour l'entrée existante
            let updateFields = {};

            if (displayer_status !== undefined) {
                updateFields[`displayer_fulfiller.${existingIndex}.displayer_status`] = safeDisplayerStatus;
            }
            if (fulfiller_status !== undefined) {
                updateFields[`displayer_fulfiller.${existingIndex}.fulfiller_status`] = safeFulfillerStatus;
            }
            if (vendor_sales_price !== undefined) {
                updateFields[`displayer_fulfiller.${existingIndex}.vendor_sales_price`] = vendor_sales_price;
            }
            if (multi_vendor_support !== undefined) {
                updateFields[`displayer_fulfiller.${existingIndex}.multi_vendor_support`] = multi_vendor_support;
            }

            await Product.updateOne(
                { _id: product_id },
                { $set: updateFields }
            );
        } else {
            // Créer nouvelle entrée
            let newEntry = {
                vendor_id: mongoose.Types.ObjectId(vendor_id),
                displayer_status: safeDisplayerStatus,
                fulfiller_status: safeFulfillerStatus,
                multi_vendor_support: multi_vendor_support !== undefined ? multi_vendor_support : true,
                vendor_sales_price: vendor_sales_price || null,
                mtg_id: req.body.mtg_id ? mongoose.Types.ObjectId(req.body.mtg_id) : null
            };

            await Product.updateOne(
                { _id: product_id },
                { $push: { displayer_fulfiller: newEntry } }
            );
        }

        let updatedProduct = await Product.findById(product_id).lean();
        let apiResponse = response.generate(0, 'Displayer-fulfiller updated successfully. Pending admin approval.', updatedProduct);
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * getProductFulfillers
 * Retourne la liste des fulfillers actifs pour un produit (vue web portal)
 */
let getProductFulfillers = async (req, res) => {
    try {
        let product_id = req.params.product_id;

        let product = await Product.findById(product_id)
            .populate('displayer_fulfiller.vendor_id', 'name')
            .populate('displayer_fulfiller.mtg_id')
            .lean();

        if (!product) {
            return res.status(404).send(response.generate(1, 'Product not found', {}));
        }

        // Filtrer: fulfiller_status === 'active' ET multi_vendor_support === true
        let activeFulfillers = (product.displayer_fulfiller || []).filter(
            f => f.fulfiller_status === 'active' && f.multi_vendor_support === true
        );

        // Si count <= 1 → pas de bouton "Choose vendor"
        if (activeFulfillers.length <= 1) {
            return res.status(200).send(response.generate(0, 'Success', { fulfillers: [] }));
        }

        // Enrichir avec les infos du store
        let enrichedFulfillers = [];
        for (let fulfiller of activeFulfillers) {
            let store = null;
            if (fulfiller.vendor_id && fulfiller.vendor_id._id) {
                store = await Store.findOne({
                    store_owner: fulfiller.vendor_id._id,
                    status: 'active'
                }).select('store_name store_slug logo').lean();
            }

            enrichedFulfillers.push({
                ...fulfiller,
                store_name: store ? store.store_name : '',
                store_slug: store ? store.store_slug : '',
                store_logo: store ? store.logo : ''
            });
        }

        let apiResponse = response.generate(0, 'Success', { fulfillers: enrichedFulfillers });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

module.exports = {
    productList: productList,
    productDetails: productDetails,
    productSearch: productSearch,
    settingsDetaild: settingsDetaild,
    allproductSearch: allproductSearch,
    filterStoreProduct: filterStoreProduct,
    homefilterStoreProduct: homefilterStoreProduct,
    filterContactProduct: filterContactProduct,
    filterAllStoreProduct: filterAllStoreProduct,
    getPlatformAllProducts: getPlatformAllProducts,
    updateDisplayerFulfiller: updateDisplayerFulfiller,
    getProductFulfillers: getProductFulfillers,
}
