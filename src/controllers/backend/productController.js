/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note:  Vendor store control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
const { v4: uuidv4 } = require('uuid');
// Import Model
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const sendemail = require("../../libs/sendmail");
const Roomelement = require('../../models/roomElementModel');
const MasterModule = require('../../models/masterModules');
const Prodinventoryhistory = require('../../models/productInventoryHistoryModel');
const Imagedelete = require('../../middlewares/fileDelete');
const SubAdminModule = require('../../models/subAminModules');
const commonLib = require("../../libs/commonLib");
const addonModel = require("../../models/addonModel");
const checkLib = require("../../libs/checkLib");
const vendorModel = require("../../models/vendorModel");
const Tag = require("../../models/tagModel");
const VendorProductAccess = require("../../models/vendorProductAccess");

/**
    * @author Ankush Shome
    * @Date_Created
    * @Date_Modified  
    * @function async
    * @functionName uploadFiles
    * @functionPurpose  for uplaoding file url
    *                                                   
    * @functionParam 
    *
    * @functionSuccess API response with upload url
    *
    * @functionError {Boolean} error error is there.
    */
let uploadFiles = async (req, res) => {
    let file = req.files;
    let fileUrl = {

        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key,
        image_name: file['image'][0].key
    }
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}
/**
    * @author Md Mustakim Sarkar
    * @Date_Created 23/06/2023
    * @Date_Modified  
    * @function async
    * @functionName findAttributes
    * @functionPurpose  this function taken object and split keys and match specified filed_type is found in the last part
    * of the spilitted array. if found then other portion of the spilitted array is matched within an array provided as attribute
    * and if that key is found in the array also then we creting another result array of object with that key and value of the respectve key.
    *                                                   
    * @functionParam 
    *
    * @functionSuccess return result array as response 
    *
    * @functionError {Boolean} error error is there.
    */
let findAttributes = (data, attributes = [], field_type) => {
    try {
        let result = [];
        let values = [];
        for (const [key, value] of Object.entries(data)) {
            let t = key.split('_');
            let lastField = t[t.length - 1];
            if (lastField == field_type || lastField == `${field_type}s`) {
                t.pop();
                t = t.join('_');
                let val = t.split('-');//seconday_lense-polycarbonate_shatter_resistant_lenses_addons": "212",
                if (val.length >= 2) {
                    t = val[0];
                    val.shift();
                    val = val.join('-');
                    values.push({ [`${field_type}_slug`]: t, value_slug: val, price: value, values: "" });
                }
                if (attributes.findIndex(e => e[`${field_type}_slug`] == t || e[`${field_type}s_slug`] == t) > -1) {
                    result.push({ [`${field_type}_slug`]: t, value: value });
                }
            }
        }
        return { result, values };
    } catch (error) {
        //console.log(error)
        return [];
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @Modified_by Md Mustakim Sarkar
    * @function async
    * @functionName productCreate
    * @functionPurpose  for creating product
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productCreate = async (req, res) => {
    try {
        if (!(req.body.product_sku && req.body.product_name && req.body.product_desc && req.body.catagories_name && req.body.product_price && req.body.product_availability)) {
            let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
            res.status(400);
            return res.send(apiResponse);
        }
        let skustatus = await Product.countDocuments({ "product_sku": req.body.product_sku, product_owner: mongoose.Types.ObjectId(req.user.vendor_id) })
        if (skustatus > 0) {
            let apiResponse = response.generate(1, `Same sku already exists`, null);
            res.status(400);
            return res.send(apiResponse);
        }
        let peoductslug = genLib.createProductSlug(req.body.product_name);
        let count_find_product = await Product.countDocuments({ "product_slug": { $regex: '.*' + peoductslug + '.*' } })
        let categoryDetails;
        req.body.catagories_name = req.body.catagories_name.toString();
        if (Buffer.from(req.body.catagories_name).length == 12 || Buffer.from(req.body.catagories_name).length == 24) {
            categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(req.body.catagories_name) });
        } else {
            categoryDetails = await Category.find();
            categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', req.body.catagories_name);
        }
        let attribute = findAttributes(req.body, categoryDetails.attributes, 'attribute')
        attribute = attribute.result;

        for (let item of categoryDetails.attributes) {
            if (item.is_mandatory == true && attribute.findIndex(e => e.attribute_slug == item.attribute_slug) == -1) {
                let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                res.status(400);
                return res.send(apiResponse);
            }
            if (req.body.upload_attribute_image) {
                let files = req.body.upload_attribute_image.find(e => {//getting files which are receiving separetly
                    let t = e.keyname.split('_');
                    t.pop();
                    t = t.join('_');
                    if (t == item.attribute_slug) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (files) {
                    let index = attribute.findIndex(e => e.attribute_slug == item.attribute_slug);
                    attribute[index].value = files.fileUrl;
                }
            }
            if (item.is_mandatory == true && attribute.findIndex(e => e.attribute_slug == item.attribute_slug && !checkLib.isEmpty(e.value)) == -1) {
                let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                res.status(400);
                return res.send(apiResponse);
            }

        }
        let add_ons = [];
        if (req.body.is_custom_addons == true) {
            let addonsData = findAttributes(req.body, categoryDetails.addons, 'addon')
            let addons = addonsData.result;
            //console.log(addons)
            for (let item of categoryDetails.addons) {
                if (item.is_mandatory == true && await addons.findIndex(e => e.addon_slug == item.addon_slug) == -1) {
                    let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                    res.status(400);
                    return res.send(apiResponse);
                }
                let checkdata = await addons.filter(e => e.addon_slug == item.addon_slug);

                let index = await checkdata.findIndex(e => checkLib.isEmpty(e.value) == true)
                //console.log(item.addon_slug, checkdata,index,item);
                if (item.is_mandatory == true && index > -1) {
                    let apiResponse = response.generate(1, ` Please fill all mandatory fields addons`, null);
                    res.status(400);
                    return res.send(apiResponse);
                }
                let value_image = "";

                let temp = await addonsData.values.filter(e => e.addon_slug == item.addon_slug);

                await Promise.all(temp.map(async e => {
                    e.value_image = "";
                    let cat_addon = await item.add_ons_value.find(el => el.value_slug = e.value_slug);
                    if (cat_addon)
                        e.value_image = cat_addon.value_image;
                }))

                item.add_ons_value = temp;

                if (!item.add_ons_value || item.add_ons_value.length == 0) {
                    let index = await addons.findIndex(e => e.addon_slug == item.addon_slug)
                    if (index > -1) {
                        item.add_ons_value = [{ addon_slug: item.addon_slug, value_slug: "", price: addons[index].value, value_image: value_image, values: "" }];
                    }
                }

                add_ons.push(item);
            }
        }


        // Check if brand_name is a valid ObjectId
        let brandId = mongoose.Types.ObjectId.isValid(req.body.brand_name) ? req.body.brand_name : null;

        if (!brandId) {
            throw new Error('Brand Id is not correct');
        }

        let newProduct = new Product({
            product_sku: req.body.product_sku,
            product_name: req.body.product_name,
            product_slug: (count_find_product > 0) ? peoductslug + '-' + (count_find_product + 1) : peoductslug,
            product_external_link: req.body.external_link,
            product_description: req.body.product_desc,
            product_bg_color: req.body.product_bg_color,
            product_category: req.body.catagories_name,
            product_brand: {
                _id: brandId
            },
            product_sub_categories: req.body.subcategories,
            product_owner: {
                _id: req.user.vendor_id
            },
            product_image: req.body.product_image,
            product_3d_image: req.body.product_3d_image,
            product_retail_price: req.body.product_price,
            product_sale_price: req.body.sale_price,
            product_3dservice_status: req.body.product_3dservice_status,
            stock: req.body.stock,
            product_availability: req.body.product_availability,
            status: 'pending',
            attributes: attribute,
            add_ons: add_ons,
            is_addons_required: req.body.is_addons_required,
            is_custom_addons: req.body.is_custom_addons,
            tags: req.body.tag_List ? req.body.tag_List : [],
            product_meta_tags: req.body.product_meta_tags ? req.body.product_meta_tags : []
        });


        let productResult = await newProduct.save();

        let newprehistintv = new Prodinventoryhistory({
            product_id: mongoose.Types.ObjectId(newProduct._id),
            inventory_status: 'product create',
            stock: req.body.stock,
            update_stock: req.body.stock,
        });



        let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();

        let alladmins = await SubAdminModule.aggregate([{
            $match: {
                $and: [
                    { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
                ]
            }
        },
        {
            $lookup: {
                from: "admins",
                localField: "subadmin_id",
                foreignField: "_id",
                as: "subadmin",
            }
        },
        {
            $unwind: "$subadmin"
        },
        {
            "$project": {
                "_id": 1,
                "module_id": 1,
                "subadmin_id": 1,
                "subadmin._id": 1,
                "subadmin.email": 1,
                "subadmin.role": 1,
            }
        }
        ]);


        let admin_emails = alladmins.map((elem) => {
            return elem.subadmin['email'];
        })

        let option = {
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have new Product Created. Plaese APPROVE  my product.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-product-list/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : New Product Created`

        }
        //sendemail.sendMailFunc(option);

        await newprehistintv.save();

        let apiResponse = response.generate(0, ` Success`, productResult);
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
    * @Date_Created 10/1/2025
    * @Date_Modified  10/1/2025
    * @Modified_by Munnaf Hossain
    * @function async
    * @functionName productSearch
    * @functionPurpose  for product search
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productSearch = async (req, res) => {
    try {
        let searchString = req.query.search;
        let vendor_id = req.user.vendor_id;
        // console.log('vendor_id--------', vendor_id);
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
                            {
                                $or: [
                                    { status: 'active' },
                                    { status: 'pending' }
                                ]
                            },
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

        let apiResponse = response.generate(0, `Success`, {
            products: record,
            totalRecords: totalRecords
        });
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName getRoomElementList
    * @functionPurpose  get room elements
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let getRoomElementList = async (req) => {
    try {
        //console.log(req.department_room);
        let department_id = req.department_room
        let record = await Roomelement.aggregate([{
            $unwind: "$roomelement_configaration"
        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(department_id)
            }
        },
        {
            $lookup: {
                from: "roomsizes",
                let: {
                    roomelement_configaration: "$roomelement_configaration"
                },
                pipeline: [{
                    $match: {
                        $expr: { $eq: ["$_id", "$$roomelement_configaration.room_size"] }
                    }
                }],
                as: "roomelement_configaration.room_size"
            }
        },
        {
            $unwind: "$roomelement_configaration.room_size"
        },
        {
            $group: {
                _id: "$_id",
                roomelement_configaration: {
                    $push: "$roomelement_configaration"
                },
                data: {
                    $first: "$$ROOT"
                }
            }
        },
        {
            $addFields: {
                'data.roomelement_configaration': "$roomelement_configaration"
            }
        },
        {
            "$project": {
                "data.roomelement_configaration.room_size.status": 0,
                "data.roomelement_configaration.room_size.createdAt": 0,
                "data.roomelement_configaration.room_size.updatedAt": 0,
                "data.roomelement_configaration.room_size.__v": 0,

                "data.status": 0,
                "data.createdAt": 0,
                "data.updatedAt": 0,
                "data.__v": 0,

            }
        },
        {
            $replaceRoot: {
                newRoot: "$data"
            }
        }
        ]);
        //console.log(record);
        if (record.length > 0) {
            return record[0];
        } else {
            return {};
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
    * @function async
    * @functionName productList
    * @functionPurpose  listing of products
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productList = async (req, res) => {
    let vendor_id
    if (req.user.vendor_type == 'access' && req.user.is_copy) {
        vendor_id = req.user.main_vendor_id;
    }
    else {
        vendor_id = req.user.vendor_id;
    }



    // Pagination parameters
    let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

    try {
        // Build the condition for filtering products
        let condition = [
            { "product_owner": mongoose.Types.ObjectId(vendor_id) },
            { "$or": [{ status: 'active' }, { status: 'pending' }] }
        ];

        // Count the total number of records for pagination
        let totalRecords = await Product.countDocuments({ $and: condition });

        // Fetch paginated records
        let record = await Product.aggregate([
            { $match: { $and: condition } },
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
                    "status": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "copied_by_vendors": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            // Add pagination logic
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        // If records are found, map category names
        if (record.length > 0) {
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
        }

        // Send the paginated response with total records
        let apiResponse = response.generate(0, `Success`, {
            products: record,
            totalRecords: totalRecords
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
}


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName productDetails
    * @functionPurpose  details of product by the slug
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    * @Modified_by Md Mustakim Sarkar
    */
let productDetails = async (req, res) => {
    let product_slug = req.params.slug;
    try {
        // Base match condition
        let matchCondition = {
            $and: [{ "product_slug": product_slug }, { "$or": [{ status: 'active' }, { status: 'pending' }] }]
        };

        let lookupStages = [
            // Lookup vendor data
            {
                $lookup: {
                    from: "vendors",
                    localField: "product_owner",
                    foreignField: "_id",
                    as: "product_owner",
                }
            },
            { $unwind: '$product_owner' },

            // Lookup brand data
            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "product_brand",
                }
            },
            { $unwind: '$product_brand' },

            // Lookup vendorproductaccesses data
            {
                $lookup: {
                    from: "vendorproductaccesses",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "vendorproductaccesses",
                }
            },
            {
                $unwind: {
                    path: '$vendorproductaccesses',
                    preserveNullAndEmptyArrays: true // Allow products without vendorproductaccesses data
                }
            }
        ];

        let aggregatePipeline = [
            { $match: matchCondition },
            ...lookupStages,
            {
                "$project": {
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
                    "vendorproductaccesses": 1,  // Return vendorproductaccesses object for later filtering
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
            }
        ];

        let record = await Product.aggregate(aggregatePipeline);

        if (record.length > 0) {
            record = record[0];
            let categoryDetails;

            // Step 1: Check vendor access if vendor is 'access' and is_copy is true
            if (req.user.vendor_type === 'access' && req.user.is_copy) {
                // Check if vendorproductaccesses contains the current vendor
                if (record.vendorproductaccesses && record.vendorproductaccesses.vendor_id.toString() !== req.user.vendor_id.toString()) {
                    // If vendor_id doesn't match, remove the vendorproductaccesses key
                    delete record.vendorproductaccesses;
                }
            }

            // Step 2: Handle product category logic
            record.product_category = record.product_category.toString();
            if (Buffer.from(record.product_category).length == 12 || Buffer.from(record.product_category).length == 24) {
                categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(record.product_category) });
                record.product_category_id = record.product_category;
                record.product_category_name = categoryDetails.category_name;
                record.product_category = categoryDetails;
            } else {
                categoryDetails = await Category.find();
                categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', record.product_category);
                record.product_category_id = record.product_category;
                record.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', record.product_category).category_name;
                record.product_category = categoryDetails;
            }

            // Step 3: Handle add_ons logic
            let id = categoryDetails._id.toString();
            if (record.is_addons_required == true && record.is_custom_addons == false) {
                let add_ons_data = await addonModel.findOne({
                    $and: [{ product_category_id: id }, { vendor_id: mongoose.Types.ObjectId(record.product_owner._id) }]
                });
                if (add_ons_data)
                    record.add_ons = add_ons_data.add_ons;
            }

            // Step 4: Fetch subcategories details
            let product_sub_categories = [];
            let subcategories = record.product_sub_categories;
            if (subcategories.length > 0) {
                for (const subcat of subcategories) {
                    let maincategoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(subcat.category_id) });
                    if (subcat.child_category_id) {
                        let subcateDetails = await commonLib.findNestedObj(maincategoryDetails, 'category_id', subcat.child_category_id);
                        product_sub_categories.push(subcateDetails);
                    }
                }
            }
            record.product_sub_categories = product_sub_categories;

        } else {
            record = {};
        }

        let apiResponse = response.generate(0, `Success`, record);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  04-07-2023
    * @Modified_by Md Mustakim Sarkar
    * @function async
    * @functionName productUpdate
    * @functionPurpose  product update controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productUpdate = async (req, res) => {
    try {
        let result = {}
        let vendor_id
        let productdetail = await Product.find({ _id: mongoose.Types.ObjectId(req.body.product_id) }).lean();
        if (!productdetail.length) {
            return res.status(404).send(response.generate(1, 'Product not found', {}));
        }

        // For access vendors with copied products
        if (req.user.vendor_type == 'access' && req.user.is_copy) {

            // Check if there is already a record for this product in VendorProductAccess
            let existingCheck = await VendorProductAccess.findOne({
                product_id: req.body.product_id,
                field_name_edit: 'product_3d_image'
            });

            // Case 1: If the record exists but the vendor_id is different, throw an error
            if (existingCheck && existingCheck.vendor_id.toString() !== req.user.vendor_id.toString()) {
                // Vendor mismatch - another vendor has already edited this product
                throw new Error('You are not allowed to edit this product.');
            }
            // Case 2: If there is no record or vendor_id matches the current vendor, allow editing or adding new data
            else {
                // Get the current product_3d_image array
                let existingProduct3DImageArray = productdetail[0].product_3d_image;

                // Compare the new product_3d_image array with the existing one
                let isDifferent = JSON.stringify(existingProduct3DImageArray) !== JSON.stringify(req.body.product_3d_image);

                if (isDifferent) {
                    // Check if there are any pending changes for this vendor and product
                    let existingPendingChange = await VendorProductAccess.findOne({
                        vendor_id: req.user.vendor_id,
                        main_vendor_id: req.user.main_vendor_id,
                        product_id: req.body.product_id,
                        field_name_edit: 'product_3d_image'
                    });

                    // If a pending change exists, update it with the new 3D image data
                    if (existingPendingChange) {
                        existingPendingChange.field_new_value = req.body.product_3d_image; // Store new 3D image array
                        existingPendingChange.status = 'pending';
                        existingPendingChange.vendor_approve = false;
                        existingPendingChange.admin_approve = false;
                        await existingPendingChange.save(); // Save updated pending change
                    }
                    // If no pending change exists, create a new pending change entry
                    else {
                        let vendorProductAObj = new VendorProductAccess({
                            vendor_id: req.user.vendor_id,
                            main_vendor_id: req.user.main_vendor_id,
                            product_id: req.body.product_id,
                            field_name_edit: 'product_3d_image',
                            field_new_value: req.body.product_3d_image, // Store new 3D image array
                            field_old_value: existingProduct3DImageArray, // Store old 3D image array
                            status: 'pending'
                        });

                        await vendorProductAObj.save(); // Save new pending change entry
                    }
                }
            }
        }
        else {
            // For non-access vendors or direct product owners
            vendor_id = req.user.vendor_id;


            if (!(req.body.product_sku && req.body.product_name && req.body.product_desc && req.body.catagories_name && req.body.product_price && req.body.product_availability)) {

                let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                res.status(400);
                return res.send(apiResponse);
            }

            let productimgList = req.body.product_image.map((img) => {
                if (!img._id) {
                    img._id = uuidv4()
                }
                return img

            })
            let categoryDetails;
            req.body.catagories_name = req.body.catagories_name.toString();
            if (Buffer.from(req.body.catagories_name).length == 12 || Buffer.from(req.body.catagories_name).length == 24) {
                categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(req.body.catagories_name) });
            } else {
                categoryDetails = await Category.find();
                categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', req.body.catagories_name);
            }
            let attribute = findAttributes(req.body, categoryDetails.attributes, 'attribute')
            attribute = attribute.result;
            for (let item of categoryDetails.attributes) {
                if (item.is_mandatory == true && attribute.findIndex(e => e.attribute_slug == item.attribute_slug) == -1) {
                    let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                    res.status(400);
                    return res.send(apiResponse);
                }
                if (req.body.upload_attribute_image) {
                    let files = req.body.upload_attribute_image.find(e => {//getting files which are receiving separetly
                        let t = e.keyname.split('_');
                        t.pop();
                        t = t.join('_');
                        if (t == item.attribute_slug) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (files) {
                        let index = attribute.findIndex(e => e.attribute_slug == item.attribute_slug);
                        attribute[index].value = files.fileUrl;
                    }
                }
                if (item.is_mandatory == true && attribute.findIndex(e => e.attribute_slug == item.attribute_slug && !checkLib.isEmpty(e.value)) == -1) {
                    let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                    res.status(400);
                    return res.send(apiResponse);
                }
            }

            let add_ons = [];
            if (req.body.is_custom_addons == true) {
                let addonsData = findAttributes(req.body, categoryDetails.addons, 'addon')
                let addons = addonsData.result;
                //console.log(addonsData)

                for (let item of categoryDetails.addons) {
                    if (item.is_mandatory == true && await addons.findIndex(e => e.addon_slug == item.addon_slug) == -1) {
                        let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                        res.status(400);
                        return res.send(apiResponse);
                    }
                    let checkdata = await addons.filter(e => e.addon_slug == item.addon_slug);

                    let index = await checkdata.findIndex(e => checkLib.isEmpty(e.value) == true)
                    //console.log(item.addon_slug, checkdata,index,item);
                    if (item.is_mandatory == true && index > -1) {
                        let apiResponse = response.generate(1, ` Please fill all mandatory fields addons`, null);
                        res.status(400);
                        return res.send(apiResponse);
                    }
                    let value_image = "";

                    let temp = await addonsData.values.filter(e => e.addon_slug == item.addon_slug);

                    await Promise.all(temp.map(async e => {
                        e.value_image = "";

                        let cat_addon = await item.add_ons_value.find(el => el.value_slug = e.value_slug);
                        if (cat_addon)
                            e.value_image = cat_addon.value_image;
                    }))

                    item.add_ons_value = temp;

                    if (!item.add_ons_value || item.add_ons_value.length == 0) {
                        let index = await addons.findIndex(e => e.addon_slug == item.addon_slug)
                        if (index > -1) {
                            item.add_ons_value = [{ addon_slug: item.addon_slug, value_slug: "", price: addons[index].value, value_image: value_image, values: "" }];
                        }
                    }

                    add_ons.push(item);
                }
            }
            //console.log("Addons after modify========>:", add_ons)


            let productslug_final = '';
            let peoductslug = genLib.createSlug(req.body.product_name);
            let count_find_product = await Product.countDocuments({ "product_slug": { $regex: '.*' + peoductslug + '.*' } })
            if (productdetail[0].product_name == req.body.product_name) {
                productslug_final = req.body.product_slug
            } else {
                productslug_final = (count_find_product > 0) ? peoductslug + '-' + (count_find_product + 1) : peoductslug
            }

            let updatedProduct;
            // Check if brand_name is a valid ObjectId
            let brandId = mongoose.Types.ObjectId.isValid(req.body.brand_name) ? req.body.brand_name : null;

            if (!brandId) {
                throw new Error('Brand Id is not correct');
            }
            updatedProduct = {
                product_sku: req.body.product_sku,
                product_name: req.body.product_name,
                product_slug: productslug_final,
                product_external_link: req.body.external_link,
                product_description: req.body.product_desc,
                product_bg_color: req.body.product_bg_color,
                product_category: req.body.catagories_name,
                product_image: productimgList,
                product_3d_image: req.body.product_3d_image,
                product_retail_price: req.body.product_price,
                product_sale_price: req.body.sale_price,
                stock: req.body.stock,
                product_availability: req.body.product_availability,
                product_brand: {
                    _id: brandId
                },
                status: 'pending',
                product_sub_categories: req.body.subcategories,
                attributes: attribute,
                add_ons: add_ons,
                is_addons_required: req.body.is_addons_required,
                is_custom_addons: req.body.is_custom_addons,
                tags: req.body.tag_List ? req.body.tag_List : [],
                product_meta_tags: req.body.product_meta_tags ? req.body.product_meta_tags : []
            };
            let newprehistintv = new Prodinventoryhistory({
                product_id: mongoose.Types.ObjectId(req.body.product_id),
                inventory_status: 'product Update',
                stock: req.body.stock,
                update_stock: req.body.stock,
            });
            await newprehistintv.save();

            result = await Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.product_id), product_owner: mongoose.Types.ObjectId(vendor_id) }, updatedProduct, { new: true });

        }

        let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();
        let alladmins = await SubAdminModule.aggregate([{
            $match: {
                $and: [
                    { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
                ]
            }
        },
        {
            $lookup: {
                from: "admins",
                localField: "subadmin_id",
                foreignField: "_id",
                as: "subadmin",
            }
        },
        {
            $unwind: "$subadmin"
        },
        {
            "$project": {
                "_id": 1,
                "module_id": 1,
                "subadmin_id": 1,
                "subadmin._id": 1,
                "subadmin.email": 1,
                "subadmin.role": 1,
            }
        }
        ]);


        let admin_emails = alladmins.map((elem) => {
            return elem.subadmin['email'];
        })

        let option = {
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have update Product. Plaese APPROVE  my product.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-product-list/${vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : Update Product`

        }
        //sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success`, result);
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
    * @function async
    * @functionName productDelete
    * @functionPurpose  product delete controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productDelete = async (req, res) => {
    try {
        let updatedProduct = {
            status: 'deleted',
        };
        if (req.body.product_id && req.user.vendor_id) {
            await Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.product_id), product_owner: mongoose.Types.ObjectId(req.user.vendor_id) }, updatedProduct, { new: true });
        }

        let apiResponse = response.generate(0, ` Success`, updatedProduct);
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
    * @functionName productImageDelete
    * @functionPurpose  product image delete controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let productImageDelete = async (req, res) => {
    try {
        const { product_id, image_id, image_name, image_type } = req.body;

        // Delete image from storage (S3, etc.)
        await Imagedelete.productDelete(image_name);

        // Define the mapping for image_type to schema field
        let fieldToUpdate = '';
        switch (image_type) {
            case 'prodimage':
                fieldToUpdate = 'product_image';
                break;
            case 'threed':
                fieldToUpdate = 'product_3d_image';
                break;
            case 'tryon3d':
                fieldToUpdate = 'product_tryon_3d_image';
                break;
            case 'tryon2d':
                fieldToUpdate = 'product_tryon_2d_image';
                break;
            case 'store':
                fieldToUpdate = 'product_store_3d_image';
                break;
            default:
                return res.status(400).send(response.generate(1, 'Invalid image_type', {}));
        }

        // Pull the image from the specific array using image_id
        const deleteResult = await Product.updateOne(
            { _id: mongoose.Types.ObjectId(product_id) },
            {
                $pull: {
                    [fieldToUpdate]: { _id: image_id }
                }
            }
        );

        const apiResponse = response.generate(0, 'Image deleted successfully', deleteResult);
        res.status(200).send(apiResponse);
    } catch (err) {
        const apiResponse = response.generate(1, err.message, {});
        res.status(500).send(apiResponse);
    }
};

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName productImageDeleteServer
    * @functionPurpose  product image deletef from s3 server controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productImageDeleteServer = async (req, res) => {
    try {
        let deletestatus = await Imagedelete.productDelete(req.body.image_name)
        let apiResponse = response.generate(0, ` Success`, deletestatus);
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
    * @functionName productSKUcheck
    * @functionPurpose  product SKU status check controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productSKUcheck = async (req, res) => {
    try {
        let skustatus = await Product.countDocuments({ "product_sku": req.body.product_sku, product_owner: mongoose.Types.ObjectId(req.user.vendor_id) })
        let apiResponse = response.generate(0, ` Success`, skustatus);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName productLibrary
    * @functionPurpose  listing of products
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productLibrary = async (req, res) => {
    try {
        let adminVendorDeatils = await vendorModel.findOne({}).sort({ _id: 1 }).limit(1);
        let vendor_id = adminVendorDeatils._id;
        //console.log('adminVendorDeatils',adminVendorDeatils,vendor_id)
        let record, condition = new Array();
        condition = [{ "$or": [{ status: 'active' }, { status: 'pending' }] }, { "product_owner": vendor_id }]
        record = await Product.aggregate([
            { $match: { $and: condition } },

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
                    "product_category": 1,
                    "copied_by_vendors": 1,
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
                    "status": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1

                }
            }

        ]);
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
    * @author Munnaf Hossain
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName productCopyFromLibrary
    * @functionPurpose  copy of products
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let productCopyFromLibrary = async (req, res) => {
    try {
        let adminVendorDeatils = await vendorModel.findOne({}).sort({ _id: 1 }).limit(1);
        let adminVendorProducts = await Product.find({ product_owner: adminVendorDeatils._id });
        let currentVendorId = req.user.vendor_id; // Assuming req.user.vendor_id contains the current vendor's ID

        // Array to hold all the new product documents
        let newProducts = adminVendorProducts.map(adminProduct => {
            return {
                product_sku: adminProduct.product_sku,
                product_name: adminProduct.product_name,
                product_slug: adminProduct.product_slug,
                product_bg_color: adminProduct.product_bg_color,
                product_description: adminProduct.product_description,
                product_external_link: adminProduct.product_external_link,
                product_category: adminProduct.product_category,
                product_sub_categories: adminProduct.product_sub_categories,
                product_brand: adminProduct.product_brand,
                product_image: adminProduct.product_image,
                product_tryon_2d_image: adminProduct.product_tryon_2d_image,
                product_3d_image: adminProduct.product_3d_image,
                product_store_3d_image: adminProduct.product_store_3d_image,
                product_tryon_3d_image: adminProduct.product_tryon_3d_image,
                product_retail_price: adminProduct.product_retail_price,
                product_sale_price: adminProduct.product_sale_price,
                product_discount_price: adminProduct.product_discount_price,
                stock: adminProduct.stock,
                product_availability: adminProduct.product_availability,
                product_3dservice_status: adminProduct.product_3dservice_status,
                status: adminProduct.status,
                attributes: adminProduct.attributes,
                add_ons: adminProduct.add_ons,
                is_custom_addons: adminProduct.is_custom_addons,
                is_addons_required: adminProduct.is_addons_required,
                product_owner: currentVendorId, // Set the current vendor as the owner
                copied_by_vendors: [adminVendorDeatils._id], // Add the admin vendor to copied_by_vendors
                product_meta_tags: adminProduct.product_meta_tags || [],
            };
        });
        await Product.insertMany(newProducts, { ordered: false });

        let apiResponse = response.generate(0, ` Successfully copied all products`, {});
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain
    * @Date_Created 10/1/2025
    * @Date_Modified  10/1/2025
    * @function async
    * @functionName tagList
    * @functionPurpose  tag List show
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let tagList = async (req, res) => {
    // Default values for pagination
    let page = req.query.page ? parseInt(req.query.page) : null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        // Base query to filter active and pending tags
        let query = { "$or": [{ status: 'active' }, { status: 'pending' }] };
        let tagList;
        const totalTags = await Tag.countDocuments(query); // Total count for tag matching the query

        // If page and limit are provided, apply pagination
        if (page && limit) {
            tagList = await Tag.find(query).skip((page - 1) * limit).limit(limit).lean();
            // Return paginated data with total count
            let apiResponse = response.generate(0, `Success`, { tagList, totalTags });
            res.status(200).send(apiResponse);
        } else {
            // If no pagination params are provided, return all matching tags
            tagList = await Tag.find(query).lean();
            // Return only the tagList
            let apiResponse = response.generate(0, `Success`, tagList);
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName pendingProductList
    * @functionPurpose  listing of products
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let pendingProductList = async (req, res) => {
    try {
        let vendor_id;
        let totalRecords
        let record
        // Pagination parameters
        let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        // Check access for the vendor
        if (req.user.vendor_type == 'access' && req.user.is_copy) {
            vendor_id = req.user.main_vendor_id;
            condition = {
                "main_vendor_id": mongoose.Types.ObjectId(req.user.main_vendor_id), // Filter by the main vendor's ID
                "vendor_id": mongoose.Types.ObjectId(req.user.vendor_id), // Filter by the main vendor's ID
                status: 'pending' // Only pending changes
            };

            // Count the total number of pending records for pagination
            totalRecords = await VendorProductAccess.countDocuments(condition);

            // Fetch paginated pending products and their details
            record = await VendorProductAccess.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "products", // Look up product details from the product collection
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product_details"
                    }
                },
                { $unwind: "$product_details" },
                {
                    $lookup: {
                        from: "vendors", // Look up the vendor (main vendor) details
                        localField: "main_vendor_id",
                        foreignField: "_id",
                        as: "main_vendor_details"
                    }
                },
                { $unwind: "$main_vendor_details" },
                {
                    "$project": {
                        "_id": 1,
                        "field_name_edit": 1,
                        "field_new_value": 1,
                        "field_old_value": 1,
                        "status": 1,
                        "product_details._id": 1,
                        "product_details.product_sku": 1,
                        "product_details.product_name": 1,
                        "product_details.product_slug": 1,
                        "product_details.product_external_link": 1,
                        "product_details.product_description": 1,
                        "product_details.product_bg_color": 1,
                        "product_details.product_category": 1,
                        "product_details.product_image": 1,
                        "product_details.product_retail_price": 1,
                        "product_details.product_sale_price": 1,
                        "product_details.product_availability": 1,
                        "product_details.status": 1,
                        "main_vendor_details._id": 1,
                        "main_vendor_details.name": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                },
                // Add pagination logic
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);
        } else {
            vendor_id = req.user.vendor_id;

            // Build the condition for filtering pending products
            let condition = {
                main_vendor_id: mongoose.Types.ObjectId(vendor_id), // Filter by the main vendor's ID
                vendor_approve: false,
                status: 'pending' // Only pending changes
            };

            // Count the total number of pending records for pagination
            totalRecords = await VendorProductAccess.countDocuments(condition);

            // Fetch paginated pending products and their details
            record = await VendorProductAccess.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "products", // Look up product details from the product collection
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product_details"
                    }
                },
                { $unwind: "$product_details" },
                {
                    $lookup: {
                        from: "vendors", // Look up the vendor (main vendor) details
                        localField: "main_vendor_id",
                        foreignField: "_id",
                        as: "main_vendor_details"
                    }
                },
                { $unwind: "$main_vendor_details" },
                {
                    "$project": {
                        "_id": 1,
                        "field_name_edit": 1,
                        "field_new_value": 1,
                        "field_old_value": 1,
                        "status": 1,
                        "product_details._id": 1,
                        "product_details.product_sku": 1,
                        "product_details.product_name": 1,
                        "product_details.product_slug": 1,
                        "product_details.product_external_link": 1,
                        "product_details.product_description": 1,
                        "product_details.product_bg_color": 1,
                        "product_details.product_category": 1,
                        "product_details.product_image": 1,
                        "product_details.product_retail_price": 1,
                        "product_details.product_sale_price": 1,
                        "product_details.product_availability": 1,
                        "product_details.status": 1,
                        "main_vendor_details._id": 1,
                        "main_vendor_details.name": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                },
                // Add pagination logic
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);
        }



        // If records are found, map category names
        if (record.length > 0) {
            let categoryIds = record.map(element => element.product_details.product_category.toString());
            let categoryDetailsMap = {};

            if (categoryIds.length) {
                let categories = await Category.find({ _id: { $in: categoryIds } }).select('_id category_name').lean();
                categories.forEach(category => {
                    categoryDetailsMap[category._id] = category.category_name;
                });
            }

            record.forEach(element => {
                let categoryId = element.product_details.product_category.toString();
                element.product_details.product_category_name = categoryDetailsMap[categoryId] || "";
            });
        }

        // Send the paginated response with total records
        let apiResponse = response.generate(0, `Success`, {
            products: record,
            totalRecords: totalRecords
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName approveProductList
    * @functionPurpose  listing of products
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let approveProductList = async (req, res) => {
    try {
        let vendor_id;
        let totalRecords
        let record
        // Pagination parameters
        let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        // Check access for the vendor
        if (req.user.vendor_type == 'access' && req.user.is_copy) {
            vendor_id = req.user.main_vendor_id;
            condition = {
                "main_vendor_id": mongoose.Types.ObjectId(req.user.main_vendor_id), // Filter by the main vendor's ID
                "vendor_id": mongoose.Types.ObjectId(req.user.vendor_id), // Filter by the main vendor's ID
                status: 'active' // Only Active changes
            };

            // Count the total number of Active records for pagination
            totalRecords = await VendorProductAccess.countDocuments(condition);

            // Fetch paginated pending products and their details
            record = await VendorProductAccess.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "products", // Look up product details from the product collection
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product_details"
                    }
                },
                { $unwind: "$product_details" },
                {
                    $lookup: {
                        from: "vendors", // Look up the vendor (main vendor) details
                        localField: "main_vendor_id",
                        foreignField: "_id",
                        as: "main_vendor_details"
                    }
                },
                { $unwind: "$main_vendor_details" },
                {
                    "$project": {
                        "_id": 1,
                        "field_name_edit": 1,
                        "field_new_value": 1,
                        "field_old_value": 1,
                        "status": 1,
                        "product_details._id": 1,
                        "product_details.product_sku": 1,
                        "product_details.product_name": 1,
                        "product_details.product_slug": 1,
                        "product_details.product_external_link": 1,
                        "product_details.product_description": 1,
                        "product_details.product_bg_color": 1,
                        "product_details.product_category": 1,
                        "product_details.product_image": 1,
                        "product_details.product_retail_price": 1,
                        "product_details.product_sale_price": 1,
                        "product_details.product_availability": 1,
                        "product_details.status": 1,
                        "main_vendor_details._id": 1,
                        "main_vendor_details.name": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                },
                // Add pagination logic
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);
        } else {
            vendor_id = req.user.vendor_id;

            // Build the condition for filtering Active products
            let condition = {
                main_vendor_id: mongoose.Types.ObjectId(vendor_id), // Filter by the main vendor's ID
                status: 'active' // Only Active changes
            };

            // Count the total number of Active records for pagination
            totalRecords = await VendorProductAccess.countDocuments(condition);

            // Fetch paginated Active products and their details
            record = await VendorProductAccess.aggregate([
                { $match: condition },
                {
                    $lookup: {
                        from: "products", // Look up product details from the product collection
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product_details"
                    }
                },
                { $unwind: "$product_details" },
                {
                    $lookup: {
                        from: "vendors", // Look up the vendor (main vendor) details
                        localField: "main_vendor_id",
                        foreignField: "_id",
                        as: "main_vendor_details"
                    }
                },
                { $unwind: "$main_vendor_details" },
                {
                    "$project": {
                        "_id": 1,
                        "field_name_edit": 1,
                        "field_new_value": 1,
                        "field_old_value": 1,
                        "status": 1,
                        "product_details._id": 1,
                        "product_details.product_sku": 1,
                        "product_details.product_name": 1,
                        "product_details.product_slug": 1,
                        "product_details.product_external_link": 1,
                        "product_details.product_description": 1,
                        "product_details.product_bg_color": 1,
                        "product_details.product_category": 1,
                        "product_details.product_image": 1,
                        "product_details.product_retail_price": 1,
                        "product_details.product_sale_price": 1,
                        "product_details.product_availability": 1,
                        "product_details.status": 1,
                        "main_vendor_details._id": 1,
                        "main_vendor_details.name": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                },
                // Add pagination logic
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);
        }



        // If records are found, map category names
        if (record.length > 0) {
            let categoryIds = record.map(element => element.product_details.product_category.toString());
            let categoryDetailsMap = {};

            if (categoryIds.length) {
                let categories = await Category.find({ _id: { $in: categoryIds } }).select('_id category_name').lean();
                categories.forEach(category => {
                    categoryDetailsMap[category._id] = category.category_name;
                });
            }

            record.forEach(element => {
                let categoryId = element.product_details.product_category.toString();
                element.product_details.product_category_name = categoryDetailsMap[categoryId] || "";
            });
        }

        // Send the paginated response with total records
        let apiResponse = response.generate(0, `Success`, {
            products: record,
            totalRecords: totalRecords
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName productActivation
    * @functionPurpose  active access vendor pending product fields like 3D file by main vendor
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

const productActivation = async (req, res) => {
    try {
        let product_id = req.body.product_id;
        let vendor_id = req.user.vendor_id;

        // Check if the user is the main vendor
        let mainVendor = await Product.findOne({
            _id: mongoose.Types.ObjectId(product_id),
            product_owner: mongoose.Types.ObjectId(vendor_id)
        }).lean();

        if (!mainVendor) {
            return res.status(403).send(response.generate(1, 'You are not authorized to approve this update', {}));
        }

        // Find pending updates in VendorProductAccess for the product_3d_image field
        let pendingUpdate = await VendorProductAccess.findOne({
            product_id: mongoose.Types.ObjectId(product_id),
            main_vendor_id: mongoose.Types.ObjectId(vendor_id),
            field_name_edit: 'product_3d_image',
            status: 'pending'
        });

        if (!pendingUpdate) {
            return res.status(404).send(response.generate(1, 'No pending 3D image update found for this product', {}));
        }
        let updatedProduct
        if (pendingUpdate.admin_approve) {
            // Parse the new value for the product_3d_image from the pending update
            let newProduct3DImageArray = pendingUpdate.field_new_value;

            // Update the main product collection with the approved 3D image
            updatedProduct = await Product.findOneAndUpdate(
                { _id: mongoose.Types.ObjectId(product_id), product_owner: mongoose.Types.ObjectId(vendor_id) },
                { product_3d_image: newProduct3DImageArray },
                { new: true }
            );

            if (!updatedProduct) {
                return res.status(500).send(response.generate(1, 'Product update failed', {}));
            }
            pendingUpdate.status = 'active';
        }

        // Mark the change as active in VendorProductAccess
        pendingUpdate.vendor_approve = true;
        await pendingUpdate.save();

        // Return success response
        return res.status(200).send(response.generate(0, 'Product 3D image successfully updated and approved', {}));

    } catch (error) {
        return res.status(500).send(response.generate(1, error.message, {}));
    }
};


/**
 * exports from this file to be used by another files.
 */
/**
 * updateDisplayerFulfillerStatus
 * Admin: Approuver/rejeter le statut displayer-fulfiller d'un vendor pour un produit
 */
let updateDisplayerFulfillerStatus = async (req, res) => {
    try {
        let product_id = req.params.product_id;
        let vendor_id = req.params.vendor_id;
        let { displayer_status, fulfiller_status } = req.body;

        // Valider les valeurs possibles
        let validStatuses = ['active', 'inactive'];
        if (displayer_status && !validStatuses.includes(displayer_status)) {
            return res.status(400).send(response.generate(1, 'displayer_status must be "active" or "inactive"', {}));
        }
        if (fulfiller_status && !validStatuses.includes(fulfiller_status)) {
            return res.status(400).send(response.generate(1, 'fulfiller_status must be "active" or "inactive"', {}));
        }

        let updateFields = {};
        if (displayer_status) {
            updateFields['displayer_fulfiller.$.displayer_status'] = displayer_status;
        }
        if (fulfiller_status) {
            updateFields['displayer_fulfiller.$.fulfiller_status'] = fulfiller_status;
        }

        let result = await Product.updateOne(
            { _id: mongoose.Types.ObjectId(product_id), 'displayer_fulfiller.vendor_id': mongoose.Types.ObjectId(vendor_id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send(response.generate(1, 'Product or vendor entry not found', {}));
        }

        let updatedProduct = await Product.findById(product_id).lean();
        let apiResponse = response.generate(0, 'Displayer-fulfiller status updated by admin', updatedProduct);
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * getPendingDisplayerFulfillers
 * Admin: Liste tous les produits ayant des displayer-fulfiller en pending
 */
let getPendingDisplayerFulfillers = async (req, res) => {
    try {
        let pendingProducts = await Product.find({
            $or: [
                { 'displayer_fulfiller.displayer_status': 'pending' },
                { 'displayer_fulfiller.fulfiller_status': 'pending' }
            ]
        })
        .populate('product_owner', 'name')
        .populate('displayer_fulfiller.vendor_id', 'name email')
        .lean();

        // Enrichir: ne retourner que les entrées pending
        let pendingEntries = [];
        for (let product of pendingProducts) {
            let pendingDF = (product.displayer_fulfiller || []).filter(
                df => df.displayer_status === 'pending' || df.fulfiller_status === 'pending'
            );
            for (let df of pendingDF) {
                pendingEntries.push({
                    product_id: product._id,
                    product_name: product.product_name,
                    product_owner: product.product_owner,
                    vendor_id: df.vendor_id,
                    displayer_status: df.displayer_status,
                    fulfiller_status: df.fulfiller_status,
                    vendor_sales_price: df.vendor_sales_price,
                    multi_vendor_support: df.multi_vendor_support,
                    createdAt: product.updatedAt
                });
            }
        }

        let apiResponse = response.generate(0, 'Success', { pendingEntries });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

module.exports = {
    uploadFiles: uploadFiles,
    productCreate: productCreate,
    productSearch: productSearch,
    productList: productList,
    productDetails: productDetails,
    productUpdate: productUpdate,
    productDelete: productDelete,
    productImageDelete: productImageDelete,
    productImageDeleteServer: productImageDeleteServer,
    productSKUcheck: productSKUcheck,
    productLibrary: productLibrary,
    productCopyFromLibrary: productCopyFromLibrary,
    tagList: tagList,
    pendingProductList: pendingProductList,
    approveProductList: approveProductList,
    productActivation: productActivation,
    updateDisplayerFulfillerStatus: updateDisplayerFulfillerStatus,
    getPendingDisplayerFulfillers: getPendingDisplayerFulfillers,
}