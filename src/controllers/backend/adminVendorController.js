/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note:  Vendor store control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { dirname } = require('path');
const { v4: uuidv4 } = require('uuid');
var handlebars = require('handlebars');
var fs = require('fs');
const response = require("../../libs/responseLib");
const crypto = require("../../libs/passwordLib");
const JWT = require('../../libs/tokenLib');
const appConfig = require("../../../config/appConfig");
const sendemail = require("../../libs/sendmail")
// Import Model
const Vendor = require('../../models/vendorModel');
const Admin = require('../../models/adminModel');
const Role = require('../../models/roleModel');
const mongoose = require('mongoose');
const Store = require('../../models/storeModel');
const Product = require('../../models/productModel');
const genLib = require('../../libs/genLib');
const Roomelement = require('../../models/roomElementModel');
const Roomsize = require('../../models/roomSizeModel');
const Department = require('../../models/departmentModel');
const Roomtexture = require('../../models/roomTextureMasterModel');
const Room = require('../../models/roomModel');
const order = require('../../models/orderModel');
const orderdetails = require('../../models/orderDetailsModel');
const payment = require('../../models/paymentDetailsModel');
const Vendorbanner = require('../../models/vendorBannerModel');
const Category = require('../../models/categoryModel');
const commonLib = require('../../libs/commonLib');
const checkLib = require('../../libs/checkLib');
const Userpasswordhistory = require('../../models/userPasswordHistoryModel')
const VendorProductAccess = require('../../models/vendorProductAccess')
/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName readHTMLFile
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let readHTMLFile = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            callback(err);
            throw err;

        } else {
            callback(null, html);
        }
    });
};


const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAILPASS
    }
}));

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName sendEmailRegistration
    * @functionPurpose  
    *                                                   
    * @functionParam options
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let sendEmailRegistration = (options) => {
    return new Promise((resolve, reject) => {
        //console.log(dirname(require.main.filename));
        readHTMLFile(dirname(require.main.filename) + '/views/reg.html', function (err, html) {
            let template = handlebars.compile(html);
            let replacements = {
                name: options.name,
            };
            let htmlToSend = template(replacements);
            let mailOptions = {
                from: process.env.APP_EMAIL,
                to: options.email,
                subject: 'Welcome to Ralbatech',
                html: htmlToSend
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    //console.log(error);
                    let apiResponse = response.generate(true, error.message, 0, null)
                    reject(apiResponse)
                } else {
                    //console.log('Email sent: ' + info.response);
                    let apiResponse = response.generate(false, 'Successful', 1, null)
                    resolve(apiResponse)
                }
            });
        });
    })
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorList = async (req, res) => {
    try {
        // Get page and limit from request query, with defaults to 0
        const page = parseInt(req.query.page) || 0; // Default to 0 if not provided
        const limit = parseInt(req.query.limit) || 0; // Default to 0 if not provided

        // Check if both page and limit are 0
        if (page === 0 && limit === 0) {
            // Return all vendors without pagination
            let vendorList = await Vendor.find().sort({ createdAt: -1 }).lean();
            let apiResponse = response.generate(0, `Success`, vendorList);
            res.status(200).send(apiResponse);
        } else {
            // Calculate the number of vendors to skip for pagination
            const skip = (page - 1) * limit;
            const vendorList = await Vendor.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
            const totalVendors = await Vendor.countDocuments(); // Get the total number of vendors

            // Prepare API response with pagination details
            let apiResponse = response.generate(0, `Success`, {
                vendorList,
                totalVendors,
            });
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName searchVendorList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let searchVendorList = async (req, res) => {
    let search = req.query.search || ''; // Extract search query from request params

    try {
        // Build search condition for name, email, and phone
        let searchCondition = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ]
        };
        const vendorList = await Vendor.find(searchCondition).sort({ createdAt: -1 }).lean();
        const totalVendors = await Vendor.countDocuments(searchCondition); // Get the total number of vendors

        // Prepare API response with pagination details
        let apiResponse = response.generate(0, `Success`, {
            vendorList,
            totalVendors,
        });
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorCreate = async (req, res) => {

    let password = await crypto.hash(req.body.password)

    let newUser = new Vendor({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        vendor_image: req.body.vendor_image,
        password: password
    });

    try {
        await newUser.save();
        let userDetails = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            vendor_image: req.body.vendor_image,
            phone: req.body.phone,
        }
        let option = {
            "template": `<h3>Hi ${req.body.name} !</h3><br/>
                  <p>Welcome To Ralba Technologies 3D shopping platform
                  </p><br/>
                  <p>Regards,<br/>
                  Ralba Technologies Team</p>`,
            "receiver_mail": [`${req.body.email.toLowerCase()}`],
            "subject": `Ralba Technologies : Welcome mail`

        }
        sendemail.sendMailFunc(option);
        let optionadmin = {
            "template": `<h3>Hi Admin!</h3><br/>
                  <p>New Vendor has been register
                  </p><br/>
                  <p>Here is the Details
                  </p><br/>
                  <p><b>Name :</b> ${req.body.name}
                  </p><br/>
                  <p><b>Email :</b> ${req.body.email.toLowerCase()}
                  </p><br/>
                  <p><b>Phone :</b> ${req.body.phone}
                  </p><br/>
      
                  <p>Regards,<br/>
                  Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`],
            "subject": `Ralba Technologies : New Vendor Registration`
        }
        sendemail.sendMailFunc(optionadmin);

        let apiResponse = response.generate(0, ` Success`, userDetails);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ERROR : ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName uploadVendordp
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadVendordp = async (req, res, next) => {
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
    * @functionName vendorDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorDetails = async (req, res) => {
    try {
        let record = await Vendor.findOne({ _id: mongoose.Types.ObjectId(req.body.vendor_id) }).lean();
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
    * @functionName vendorUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedVendor = {};

        for (const property in reqbody) {
            updatedVendor[property] = reqbody[property];
        }
        await Vendor.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.vendor_id) }, updatedVendor, { new: true });
        if (req.body.status) {
            updatedaccessStore =
            {
                status: req.body.status
            }

            await Store.updateMany({ main_vendor_id: req.body.vendor_id }, updatedaccessStore, { new: true });
        }
        let apiResponse = response.generate(0, ` Success`, updatedVendor);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        if (err.code === 11000) {
            // Handle duplicate key error
            let apiResponse = response.generate(1, ` Phone or Email already in use`, {});
            res.status(410);
            res.send(apiResponse)
        } else {
            // Handle other MongoDB errors
            let apiResponse = response.generate(1, ` ${err.message}`, {});
            res.status(410);
            res.send(apiResponse)
        }
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminVendorStoreList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorStoreList = async (req, res) => {
    let skip = 0;
    let limit = parseInt(req.body.limit);
    if (req.body.page > 1) {
        skip = req.body.page - 1 * limit;
    }
    try {
        let record = await Store.find({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.body.vendor_id }, null, { skip: skip, limit: limit }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
        //let record =  await Store.find({status:'active'}, null, { skip: skip, limit: limit }).populate('store_department').lean();
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
    * @functionName adminstoreDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminstoreDetails = async (req, res) => {
    try {
        let record = await Store.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], _id: mongoose.Types.ObjectId(req.body.store_id) }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
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
    * @functionName adminVendorDepartmentList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorDepartmentList = async (req, res) => {
    try {
        //console.log(req.user);
        let storeList = await Store.find({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.body.vendor_id }, { _id: 1 }).lean();


        let departmentList = await Department.find({ status: { $ne: 'deleted' }, department_store: { $in: storeList } }).populate('department_store', 'store_name status').lean();

        //console.log(departmentList);

        let results = await Promise.all(departmentList.map(async (eachObj) => {
            eachObj["department_room"] = await getRoomElementList(eachObj);
            return eachObj;
        }));
        //console.log(results);
        let apiResponse = response.generate(0, ` Success`, results);
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
    * @functionName adminVendorDepartmentDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorDepartmentDetails = async (req, res) => {
    try {
        //let storeList = await Store.find({status:'active', store_owner:req.user.vendor_id},{_id:1}).lean();
        //department_store: {$in: storeList}
        let departmentList = await Department.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], _id: mongoose.Types.ObjectId(req.body.department_id) }).populate('department_store', 'store_name status').lean();
        if (departmentList) {
            departmentList["department_room"] = await getRoomElementList(departmentList);
        }
        let apiResponse = response.generate(0, ` Success`, (departmentList) ? departmentList : {});
        res.status(200);
        res.send(apiResponse);
        rs
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
    * @functionName adminVendorProductList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorProductList = async (req, res) => {
    let vendor_id = req.query.vendor_id;
    let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

    try {
        const condition = [
            { "$or": [{ status: 'active' }, { status: 'pending' }] },
            { "product_owner": mongoose.Types.ObjectId(vendor_id) }
        ];

        // Get total count of records for pagination
        const totalCount = await Product.countDocuments({ $and: condition });

        // Fetch records with pagination
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
                    "product_availibility": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "tags": 1,
                    "status": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            // Skip and limit for pagination
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        if (record.length > 0) {
            const categoryIds = record.map(element => {
                return mongoose.Types.ObjectId(element.product_category);
            });

            const categories = await Category.find({ _id: { $in: categoryIds } }).lean();

            record = record.map(element => {
                let categoryDetails = categories.find(cat => cat._id.toString() === element.product_category.toString());
                return {
                    ...element,
                    product_category_id: element.product_category,
                    product_category_name: categoryDetails ? categoryDetails.category_name : "",
                    product_category: undefined // remove old category field
                };
            });
        }

        let apiResponse = response.generate(0, ` Success`, {
            products: record,
            totalCount: totalCount
        });
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 21/1/2025
    * @Date_Modified  21/1/2025
    * @Modified_by Munnaf Hossain
    * @function async
    * @functionName adminVendorProductSearch
    * @functionPurpose  for product search
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorProductSearch = async (req, res) => {
    try {
        let searchString = req.query.search;
        let vendor_id = req.query.vendor_id;
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


let adminVendorTryonProductList = async (req, res) => {
    let vendor_id = req.query.vendor_id;
    let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

    try {
        const condition = [
            { "$or": [{ status: 'active' }, { status: 'pending' }] },
            { "product_owner": mongoose.Types.ObjectId(vendor_id) }
        ];

        // Get total count of records for pagination with filtering
        const totalCount = await Product.countDocuments({
            $and: condition,
            $or: [
                {
                    product_3d_image: {
                        $elemMatch: {
                            pro_3d_image: { $exists: true, $ne: "" }
                        }
                    },
                    $or: [
                        { product_tryon_2d_image: { $size: 0 } },
                        { product_tryon_3d_image: { $size: 0 } },
                        { product_store_3d_image: { $size: 0 } }
                    ]
                }
            ]
        });

        // Fetch records with pagination and filtering
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
                    "product_availibility": 1,
                    "product_3dservice_status": 1,
                    "product_meta_tags": 1,
                    "tags": 1,
                    "status": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            // Filter products based on conditions
            {
                $match: {
                    $or: [
                        {
                            product_3d_image: {
                                $elemMatch: {
                                    pro_3d_image: { $exists: true, $ne: "" }
                                }
                            },
                            $or: [
                                { product_tryon_2d_image: { $size: 0 } },
                                { product_tryon_3d_image: { $size: 0 } },
                                { product_store_3d_image: { $size: 0 } }
                            ]
                        }
                    ]
                }
            },
            // Pagination
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);

        if (record.length > 0) {
            const categoryIds = record.map(element => {
                return mongoose.Types.ObjectId(element.product_category);
            });

            const categories = await Category.find({ _id: { $in: categoryIds } }).lean();

            record = record.map(element => {
                let categoryDetails = categories.find(cat => cat._id.toString() === element.product_category.toString());
                return {
                    ...element,
                    product_category_id: element.product_category,
                    product_category_name: categoryDetails ? categoryDetails.category_name : "",
                    product_category: undefined // remove old category field
                };
            });
        }

        let apiResponse = response.generate(0, ` Success`, {
            products: record,
            totalCount: totalCount
        });
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
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
        let vendorDetails
        // Pagination parameters
        let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        vendor_id = req.query.vendor_id;


        if (checkLib.isEmpty(vendor_id)) {
            throw new Error('Vendor id is required')
        }
        else {
            vendorDetails = await Vendor.findOne({ "_id": mongoose.Types.ObjectId(vendor_id) })
        }

        // Check access for the vendor
        if (vendorDetails.vendor_type == 'access' && vendorDetails.is_copy) {
            condition = {
                "main_vendor_id": mongoose.Types.ObjectId(vendorDetails.main_vendor_id), // Filter by the main vendor's ID
                "vendor_id": mongoose.Types.ObjectId(vendor_id), // Filter by the main vendor's ID
                admin_approve: false,
                status: 'pending' // Only Active changes
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

            // Build the condition for filtering Active products
            let condition = {
                main_vendor_id: mongoose.Types.ObjectId(vendor_id), // Filter by the main vendor's ID
                admin_approve: false,
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
        let vendorDetails
        // Pagination parameters
        let page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided

        vendor_id = req.query.vendor_id;


        if (checkLib.isEmpty(vendor_id)) {
            throw new Error('Vendor id is required')
        }
        else {
            vendorDetails = await Vendor.findOne({ "_id": mongoose.Types.ObjectId(vendor_id) })
        }

        // Check access for the vendor
        if (vendorDetails.vendor_type == 'access' && vendorDetails.is_copy) {
            condition = {
                "main_vendor_id": mongoose.Types.ObjectId(vendorDetails.main_vendor_id), // Filter by the main vendor's ID
                "vendor_id": mongoose.Types.ObjectId(vendor_id), // Filter by the main vendor's ID
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

VendorProductList = async (req, res) => {
    let vendor_id = req.query.vendor_id;
    try {
        let record, condition = new Array();

        condition = [{ "$or": [{ status: 'active' }, { status: 'pending' }] }, { "product_owner": mongoose.Types.ObjectId(vendor_id) }]

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
                    "product_availibility": 1,
                    "product_3dservice_status": 1,
                    "status": 1,
                    "product_meta_tags": 1,
                    "createdAt": 1,
                    "updatedAt": 1

                }
            }

        ]);
        //console.log(record);
        if (record.length > 0) {
            for (const element of record) {
                let categoryDetails;
                try {
                    element.product_category = element.product_category.toString();
                    if (Buffer.from(element.product_category).length == 12 || Buffer.from(element.product_category).length == 24) {
                        categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(element.product_category) });
                        element.product_category_id = element.product_category;
                        element.product_category_name = categoryDetails.category_name ? categoryDetails.category_name : "";
                        delete element.product_category;
                    } else {
                        categoryDetails = await Category.find();
                        categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', element.product_category);
                        element.product_category_id = element.product_category;
                        element.product_category_name = ""
                        element.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', element.product_category).category_name;
                        delete element.product_category;
                    }
                } catch (err) {
                    //console.log(err.message);
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
    * @functionName adminVendorProductUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorProductUpdate = async (req, res) => {
    try {

        if (!(req.body.product_sku && req.body.product_name && req.body.product_desc && req.body.catagories_name && req.body.product_price && req.body.product_availability)) {
            //console.log('main check pass')
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
            if (item.is_mandatory && attribute.findIndex(e => e.attribute_slug == item.attribute_slug) == -1) {
                //console.log('Second check Fails')
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

                if (item.is_mandatory == true && attribute.findIndex(e => e.attribute_slug == item.attribute_slug && !checkLib.isEmpty(e.value)) == -1) {
                    //console.log('Third check Fails')
                    let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                    res.status(400);
                    return res.send(apiResponse);
                }
            }

        }
        let add_ons = [];
        if (req.body.is_custom_addons == true) {
            let addonsData = findAttributes(req.body, categoryDetails.addons, 'addon')
            let addons = addonsData.result;

            for (let item of categoryDetails.addons) {
                if (item.is_mandatory && await addons.findIndex(e => e.addon_slug == item.addon_slug) == -1) {
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


        let productslug_final = '';
        let peoductslug = genLib.createSlug(req.body.product_name);
        let count_find_product = await Product.countDocuments({ "product_slug": { $regex: '.*' + peoductslug + '.*' } })
        let productdetail = await Product.find({ _id: mongoose.Types.ObjectId(req.body.product_id) }).lean();
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
            product_tryon_2d_image: req.body.product_tryon_2d_image,
            product_3d_image: req.body.product_3d_image,
            product_store_3d_image: req.body.product_store_3d_image,
            product_tryon_3d_image: req.body.product_tryon_3d_image,
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
        await Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.product_id) }, updatedProduct, { new: true });

        let apiResponse = response.generate(0, ` Success`, updatedProduct);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        //console.log(err)
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
        let vendor_id = req.body.vendor_id;
        let vendor_type = req.body.vendor_type;

        console.log('vendor_id------------', vendor_id)

        // Find pending updates in VendorProductAccess for the product_3d_image field
        let pendingUpdate
        if (vendor_type == 'access') {
            pendingUpdate = await VendorProductAccess.findOne({
                product_id: mongoose.Types.ObjectId(product_id),
                vendor_id: mongoose.Types.ObjectId(vendor_id),
                field_name_edit: 'product_3d_image',
                status: 'pending'
            });
        }
        else {
            pendingUpdate = await VendorProductAccess.findOne({
                product_id: mongoose.Types.ObjectId(product_id),
                main_vendor_id: mongoose.Types.ObjectId(vendor_id),
                field_name_edit: 'product_3d_image',
                status: 'pending'
            });
        }


        if (!pendingUpdate) {
            return res.status(404).send(response.generate(1, 'No pending 3D image update found for this product', {}));
        }

        let updatedProduct
        if (pendingUpdate.vendor_approve) {
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
        pendingUpdate.admin_approve = true;
        await pendingUpdate.save();

        // Return success response
        return res.status(200).send(response.generate(0, 'Product 3D image successfully updated and approved', { updatedProduct }));

    } catch (error) {
        return res.status(500).send(response.generate(1, error.message, {}));
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminVendorProductStatusChange
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorProductStatusChange = async (req, res) => {
    try {
        let updatedProduct = {
            status: req.body.status,
        };
        await Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.product_id) }, updatedProduct, { new: true });

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
    * @functionName adminBulkVendorProductStatusChange
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminBulkVendorProductStatusChange = async (req, res) => {
    try {
        let updatedProduct = {
            status: req.body.status,
        };
        await Product.updateMany({ product_owner: mongoose.Types.ObjectId(req.body.vendor_id), status: 'pending' }, updatedProduct, { new: true });

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
    * @functionName adminVendorProductDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorProductDelete = async (req, res) => {
    try {
        let updatedProduct = {
            status: 'deleted',
        };
        await Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.product_id) }, updatedProduct, { new: true });

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
    * @functionName adminvendorOrderList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let adminvendorOrderList = async (req, res) => {
    try {
        let page = parseInt(req.body.page) || 1;
        let limit = parseInt(req.body.limit) || 10;
        const skip = (page - 1) * limit;

        let order_ids = [];
        let vendorDetails = await Vendor.findOne({ _id: mongoose.Types.ObjectId(req.body.vendor_id) });
        let vendor_id = vendorDetails.is_copy ? vendorDetails.main_vendor_id : vendorDetails._id;

        // console.log('vendorDetails---', vendorDetails);
        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(vendor_id) });
        let orderdetailsdb_record2 = await orderdetails.find({ "commission_details.breakdownPercentage.access_vendor_id": mongoose.Types.ObjectId(req.body.vendor_id) });
        // console.log('orderdetailsdb_record2---', orderdetailsdb_record2);
        if (vendorDetails.is_copy) {
            for (odlist of orderdetailsdb_record2) {
                if (!order_ids.includes(String(odlist.order_id))) {
                    order_ids.push(String(odlist.order_id));
                }
            }
        }
        if (!vendorDetails.is_copy) {
            for (odlist of orderdetailsdb_record) {
                if (!order_ids.includes(String(odlist.order_id))) {
                    order_ids.push(String(odlist.order_id));
                }
            }
        }

        let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // console.log('ids-----------', ids)

        // Fetch all matching order details (before pagination)
        let orderdetails_record = await order.aggregate([
            { $match: { _id: { $in: ids } } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_id",
                }
            },
            { $unwind: '$user_id' },
            {
                $lookup: {
                    from: "payments",
                    localField: "payment_id",
                    foreignField: "_id",
                    as: "payment_id",
                }
            },
            { $unwind: '$payment_id' },
            {
                $lookup: {
                    from: "useraddresses",
                    localField: "shipping_address_id",
                    foreignField: "_id",
                    as: "shipping_address_id",
                }
            },
            { $unwind: '$shipping_address_id' },
            {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order_id",
                    as: "order_details",
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user_id.name": 1,
                    "user_id.email": 1,
                    "user_id.phone": 1,
                    "total_order_amount": 1,
                    "order_delivery_date": 1,
                    "shipping_charge": 1,
                    "tax_amount": 1,
                    "order_status": 1,
                    "payment_status": 1,
                    "payment_method": 1,
                    "payment_id.transaction_id": 1,
                    "order_details.store_id": 1,
                    "order_details.department_id": 1,
                    "order_details.vendor_id": 1,
                    "order_details.product_id": 1,
                    "order_details.product_name": 1,
                    "order_details.product_image": 1,
                    "order_details.product_slug": 1,
                    "order_details.qty": 1,
                    "order_details.price": 1,
                    "order_details.addons": 1,
                    "order_details.addonsprice": 1,
                    "order_details.commission_details": 1,
                    "transaction_id": 1,
                    "shipping_address_id.user_full_name": 1,
                    "shipping_address_id.addressline1": 1,
                    "shipping_address_id.addressline2": 1,
                    "shipping_address_id.city": 1,
                    "shipping_address_id.postal_code": 1,
                    "shipping_address_id.mobile": 1,
                    "shipping_address_id.state": 1,
                    "billing_email": 1,
                    "billing_phone": 1,
                    "billing_country": 1,
                    "billing_first_name": 1,
                    "billing_last_name": 1,
                    "billing_address1": 1,
                    "billing_address2": 1,
                    "billing_city": 1,
                    "billing_state": 1,
                    "billing_zip": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ]);

        // Now filter out orders that don't have products for the vendor
        let filteredOrders = [];
        for (let i = 0; i < orderdetails_record.length; i++) {
            let otherproducts_total_price = 0;
            // Filter order details based on vendor type (main or access)
            let vendorOrder = orderdetails_record[i].order_details.reduce((prev, curr) => {
                // Check if current user is an access vendor for the order item
                let accessVendorMatch
                if (curr.hasOwnProperty('commission_details')) {
                    accessVendorMatch = curr.commission_details.some(cd => {
                        if (cd.hasOwnProperty('breakdownPercentage')) {
                            return cd.breakdownPercentage.some(bp => {
                                return String(req.user.vendor_id) === String(bp?.access_vendor_id); // Make sure to return a boolean
                            });
                        }
                        return false; // In case breakdownPercentage doesn't exist
                    });
                }
                // If the user is the access vendor or the main vendor
                if (accessVendorMatch || String(curr.vendor_id) === String(req.user.vendor_id)) {
                    prev.push(curr); // Include the product in the vendor's order
                } else {
                    // Add price of other vendor's products (excluded from this vendor's order)
                    otherproducts_total_price += parseFloat(curr.price) + parseFloat(curr.addonsprice);
                }
                return prev;
            }, []);

            // If vendor has any products in this order, adjust the total and push to filteredOrders
            if (vendorOrder.length > 0) {
                orderdetails_record[i].total_order_amount = parseFloat(orderdetails_record[i].total_order_amount) - parseFloat(otherproducts_total_price);
                orderdetails_record[i].order_details = vendorOrder; // Assign filtered order details
                filteredOrders.push(orderdetails_record[i]); // Add to filtered list
            }
        }
        // Apply pagination to the filtered orders
        let totalOrders = filteredOrders.length;
        let paginatedOrders = filteredOrders.slice(skip, skip + limit);

        // Send the response with pagination info
        let apiResponse = response.generate(0, `Order List Showing`, {
            totalOrders: totalOrders, // Total number of filtered orders
            orders: paginatedOrders // Paginated result
        });
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminvendorOrderSearch
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */


let adminvendorOrderSearch = async (req, res) => {
    try {
        let searchString = req.query.search || '';

        if (searchString.length < 2) {
            throw new Error('Search string must be at least 2 characters long.');
        }

        let order_ids = [];
        console.log('req.query.vendor_id', req.query.vendor_id);
        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(req.query.vendor_id) });

        for (let odlist of orderdetailsdb_record) {
            if (!order_ids.includes(String(odlist.order_id))) {
                order_ids.push(String(odlist.order_id));
            }
        }

        let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // Fetch all matching order details (before pagination) with search functionality
        let orderdetails_record = await order.aggregate([
            {
                $match: {
                    _id: { $in: ids },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_id",
                }
            },
            { $unwind: '$user_id' },
            {
                $lookup: {
                    from: "payments",
                    localField: "payment_id",
                    foreignField: "_id",
                    as: "payment_id",
                }
            },
            { $unwind: '$payment_id' },
            {
                $lookup: {
                    from: "useraddresses",
                    localField: "shipping_address_id",
                    foreignField: "_id",
                    as: "shipping_address_id",
                }
            },
            { $unwind: '$shipping_address_id' },
            {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order_id",
                    as: "order_details",
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user_id.name": 1,
                    "user_id.email": 1,
                    "user_id.phone": 1,
                    "total_order_amount": 1,
                    "order_delivery_date": 1,
                    "shipping_charge": 1,
                    "tax_amount": 1,
                    "order_status": 1,
                    "payment_status": 1,
                    "payment_method": 1,
                    "payment_id.transaction_id": 1,
                    "order_details": {
                        $filter: {
                            input: "$order_details",
                            as: "order_detail",
                            cond: {
                                $regexMatch: {
                                    input: "$$order_detail.product_name",
                                    regex: searchString,
                                    options: "i"
                                }
                            }
                        }
                    },
                    "transaction_id": 1,
                    "shipping_address_id.user_full_name": 1,
                    "shipping_address_id.addressline1": 1,
                    "shipping_address_id.addressline2": 1,
                    "shipping_address_id.city": 1,
                    "shipping_address_id.postal_code": 1,
                    "shipping_address_id.mobile": 1,
                    "shipping_address_id.state": 1,
                    "billing_email": 1,
                    "billing_phone": 1,
                    "billing_country": 1,
                    "billing_first_name": 1,
                    "billing_last_name": 1,
                    "billing_address1": 1,
                    "billing_address2": 1,
                    "billing_city": 1,
                    "billing_state": 1,
                    "billing_zip": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ]);

        // Now filter out orders that don't have products for the vendor
        let filteredOrders = [];
        for (let i = 0; i < orderdetails_record.length; i++) {
            let otherproducts_total_price = 0;
            let vendorOrder = orderdetails_record[i].order_details.reduce((prev, curr) => {
                if (curr.vendor_id == req.query.vendor_id) {
                    prev.push(curr);
                } else {
                    otherproducts_total_price += parseFloat(curr.price) + parseFloat(curr.addonsprice);
                }
                return prev;
            }, []);

            // If the vendor has products in this order, update the total and add to filteredOrders
            if (vendorOrder.length > 0) {
                orderdetails_record[i].total_order_amount = parseFloat(orderdetails_record[i].total_order_amount) - parseFloat(otherproducts_total_price);
                orderdetails_record[i].order_details = vendorOrder;
                filteredOrders.push(orderdetails_record[i]);
            }
        }

        // Apply pagination to the filtered orders
        let totalOrders = filteredOrders.length;
        // Send the response with pagination info
        let apiResponse = response.generate(0, `Order Search Results`, {
            totalOrders: totalOrders, // Total number of filtered orders
            orders: filteredOrders // Paginated result
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminVendorOrderSearch
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorOrderSearch = async (req, res) => {
    try {
        let searchString = req.query.search || '';

        if (searchString.length < 2) {
            throw new Error('Search string must be at least 2 characters long.');
        }

        let order_ids = [];

        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(req.query.vendor_id) });

        for (let odlist of orderdetailsdb_record) {
            if (!order_ids.includes(String(odlist.order_id))) {
                order_ids.push(String(odlist.order_id));
            }
        }

        let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // Fetch all matching order details (before pagination) with search functionality
        let orderdetails_record = await order.aggregate([
            {
                $match: {
                    _id: { $in: ids },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_id",
                }
            },
            { $unwind: '$user_id' },
            {
                $lookup: {
                    from: "payments",
                    localField: "payment_id",
                    foreignField: "_id",
                    as: "payment_id",
                }
            },
            { $unwind: '$payment_id' },
            {
                $lookup: {
                    from: "useraddresses",
                    localField: "shipping_address_id",
                    foreignField: "_id",
                    as: "shipping_address_id",
                }
            },
            { $unwind: '$shipping_address_id' },
            {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order_id",
                    as: "order_details",
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user_id.name": 1,
                    "user_id.email": 1,
                    "user_id.phone": 1,
                    "total_order_amount": 1,
                    "order_delivery_date": 1,
                    "shipping_charge": 1,
                    "tax_amount": 1,
                    "order_status": 1,
                    "payment_status": 1,
                    "payment_method": 1,
                    "payment_id.transaction_id": 1,
                    "order_details": {
                        $filter: {
                            input: "$order_details",
                            as: "order_detail",
                            cond: {
                                $regexMatch: {
                                    input: "$$order_detail.product_name",
                                    regex: searchString,
                                    options: "i"
                                }
                            }
                        }
                    },
                    "transaction_id": 1,
                    "shipping_address_id.user_full_name": 1,
                    "shipping_address_id.addressline1": 1,
                    "shipping_address_id.addressline2": 1,
                    "shipping_address_id.city": 1,
                    "shipping_address_id.postal_code": 1,
                    "shipping_address_id.mobile": 1,
                    "shipping_address_id.state": 1,
                    "billing_email": 1,
                    "billing_phone": 1,
                    "billing_country": 1,
                    "billing_first_name": 1,
                    "billing_last_name": 1,
                    "billing_address1": 1,
                    "billing_address2": 1,
                    "billing_city": 1,
                    "billing_state": 1,
                    "billing_zip": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            }
        ]);

        // Now filter out orders that don't have products for the vendor
        let filteredOrders = [];
        for (let i = 0; i < orderdetails_record.length; i++) {
            let otherproducts_total_price = 0;
            let vendorOrder = orderdetails_record[i].order_details.reduce((prev, curr) => {
                if (curr.vendor_id == req.user.vendor_id) {
                    prev.push(curr);
                } else {
                    otherproducts_total_price += parseFloat(curr.price) + parseFloat(curr.addonsprice);
                }
                return prev;
            }, []);

            // If the vendor has products in this order, update the total and add to filteredOrders
            if (vendorOrder.length > 0) {
                orderdetails_record[i].total_order_amount = parseFloat(orderdetails_record[i].total_order_amount) - parseFloat(otherproducts_total_price);
                orderdetails_record[i].order_details = vendorOrder;
                filteredOrders.push(orderdetails_record[i]);
            }
        }

        // Apply pagination to the filtered orders
        let totalOrders = filteredOrders.length;
        // Send the response with pagination info
        let apiResponse = response.generate(0, `Order Search Results`, {
            totalOrders: totalOrders, // Total number of filtered orders
            orders: filteredOrders // Paginated result
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorOrderUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminvendorOrderUpdate = async (req, res) => {
    try {
        let updatedOderStatus = {
            order_status: req.body.order_status,
            order_delivery_date: req.body.order_delivery_date
        };
        let result = await order.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.order_id) }, updatedOderStatus, { new: true });

        let apiResponse = response.generate(0, `Oreder Update Success`, result);
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
    * @functionName adminvendorOrderDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminvendorOrderDetails = async (req, res) => {
    try {

        let orderdetails_record = await order.aggregate([
            { $match: { $and: [{ "_id": mongoose.Types.ObjectId(req.body.order_id) }] } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_id",
                }
            },
            { $unwind: '$user_id' },
            {
                $lookup: {
                    from: "payments",
                    localField: "payment_id",
                    foreignField: "_id",
                    as: "payment_id",
                }
            },
            { $unwind: '$payment_id' },
            {
                $lookup: {
                    from: "useraddresses",
                    localField: "shipping_address_id",
                    foreignField: "_id",
                    as: "shipping_address_id",
                }
            },

            { $unwind: '$shipping_address_id' },

            {
                $lookup: {
                    from: "orderdetails",
                    localField: "_id",
                    foreignField: "order_id",
                    as: "order_details",
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "order_details.product_id",
                    foreignField: "_id",
                    as: "products_details",
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "user_id.name": 1,
                    "user_id.email": 1,
                    "user_id.phone": 1,
                    "total_order_amount": 1,
                    "discount": 1,
                    "tax_amount": 1,
                    "shipping_charge": 1,
                    "order_status": 1,
                    "payment_status": 1,
                    "payment_method": 1,
                    "payment_id.transaction_id": 1,
                    "payment_id.country_code": 1,
                    "payment_id.email_address": 1,
                    "payment_id.name": 1,
                    "payment_id.customer_id_paypal": 1,
                    "payment_id.paypal_status": 1,
                    "payment_id.createdAt": 1,
                    "order_details.store_id": 1,
                    "order_details.department_id": 1,
                    "order_details.vendor_id": 1,
                    "order_details.product_id": 1,
                    "order_details.product_name": 1,
                    "order_details.product_image": 1,
                    "order_details.product_slug": 1,
                    "order_details.qty": 1,
                    "order_details.left_eye_qty": 1,
                    "order_details.right_eye_qty": 1,
                    "order_details.price": 1,
                    "order_details.addons": 1,
                    "order_details.addonsprice": 1,
                    "order_details.commission_details": 1,
                    "products_details.attributes": 1,
                    "products_details._id": 1,
                    "transaction_id": 1,
                    "shipping_address_id.user_full_name": 1,
                    "shipping_address_id.addressline1": 1,
                    "shipping_address_id.addressline2": 1,
                    "shipping_address_id.city": 1,
                    "shipping_address_id.postal_code": 1,
                    "shipping_address_id.mobile": 1,
                    "shipping_address_id.state": 1,
                    "billing_email": 1,
                    "billing_phone": 1,
                    "billing_country": 1,
                    "billing_first_name": 1,
                    "billing_last_name": 1,
                    "billing_address1": 1,
                    "billing_address2": 1,
                    "billing_city": 1,
                    "billing_state": 1,
                    "billing_zip": 1,
                    "order_delivery_date": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "return_reason": 1,
                    "return_address": 1,
                    "return_requested_at": 1,

                }
            }
        ]);

        for (let i = 0; i < orderdetails_record.length; i++) {
            for (const curr of orderdetails_record[i].order_details) {
                if (curr.commission_details && curr.commission_details[0].breakdownPercentage) {
                    for (let j = 0; j < curr.commission_details[0].breakdownPercentage.length; j++) {
                        if (curr.commission_details[0].breakdownPercentage[j].copy_vendor_id) {
                            let accessStore = await Store.findOne({ store_owner: curr.commission_details[0].breakdownPercentage[j].copy_vendor_id }, { store_name: 1, store_slug: 1, is_copy: 1, main_store_id: 1 });
                            curr.commission_details[0].breakdownPercentage[j].storeDetails = accessStore;
                            if (accessStore.is_copy && accessStore.main_store_id) {
                                curr.commission_details[0].breakdownPercentage[j].mainStoreDetails = await Store.findOne({ _id: mongoose.Types.ObjectId(accessStore.main_store_id) }, { store_name: 1, store_slug: 1, is_copy: 1, main_store_id: 1 });
                            }
                        }
                        if (curr.commission_details[0].breakdownPercentage[j].access_vendor_id) {
                            let accessStore = await Store.findOne({ store_owner: curr.commission_details[0].breakdownPercentage[j].access_vendor_id }, { store_name: 1, store_slug: 1, is_copy: 1, main_store_id: 1 });
                            curr.commission_details[0].breakdownPercentage[j].storeDetails = accessStore;
                            if (accessStore.is_copy && accessStore.main_store_id) {
                                curr.commission_details[0].breakdownPercentage[j].mainStoreDetails = await Store.findOne({ _id: mongoose.Types.ObjectId(accessStore.main_store_id) }, { store_name: 1, store_slug: 1, is_copy: 1, main_store_id: 1 });
                            }

                        }
                    }
                }
            }
        }

        // return
        let apiResponse = response.generate(0, `Order List Showing`, orderdetails_record);
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
    * @functionName getRoomElementList
    * @functionPurpose  
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
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminVendorRoomList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorRoomList = async (req, res) => {
    try {
        //let roomList = await Room.find({$and : [{status: 'active'},{vendor: req.user.vendor_id}]}).lean();
        let roomList = await Room.aggregate([{
            $match: {
                $and: [
                    { status: { $ne: 'deleted' } },
                    { vendor: mongoose.Types.ObjectId(req.body.vendor_id) }
                ]
            }
        },
        {
            $lookup: {
                from: "vendors",
                localField: "vendor",
                foreignField: "_id",
                as: "vendor"
            }
        },
        {
            $unwind: "$vendor"
        },
        {
            $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "department"
            }
        },
        {
            $unwind: "$department"
        },
        {
            $lookup: {
                from: "roomelements",
                localField: "roomelement",
                foreignField: "_id",
                as: "roomelement"
            }
        },
        {
            $unwind: "$roomelement"
        },
        {
            $lookup: {
                from: "roomsizes",
                localField: "roomesize",
                foreignField: "_id",
                as: "roomesize"
            }
        },
        {
            $unwind: "$roomesize"
        },


        {
            "$project": {
                "vendor.email": 0,
                "vendor.phone": 0,
                "vendor.password": 0,
                "vendor.vendor_image": 0,
                "vendor.status": 0,
                "vendor.stores": 0,
                "vendor.createdAt": 0,
                "vendor.updatedAt": 0,
                "vendor.__v": 0,
                "department.department_image": 0,
                "department.department_store": 0,
                "department.department_room": 0,
                "department.status": 0,
                "department.createdAt": 0,
                "department.updatedAt": 0,
                "department.__v": 0,
                "roomelement.status": 0,
                "roomelement.createdAt": 0,
                "roomelement.updatedAt": 0,
                "roomelement.__v": 0,
                "texture": 0,
                "roomelement_configaration": 0,
                "roomelement.roomelement_configaration": 0,
                "roomesize.status": 0,
                "roomesize.createdAt": 0,
                "roomesize.updatedAt": 0,
                "roomesize.__v": 0,
                "createdAt": 0,
                "updatedAt": 0,
                "__v": 0,

            }

        },
        ]);
        if (roomList.length > 0) {




        }
        let apiResponse = response.generate(0, ` Success`, roomList);
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
    * @functionName bannerStatusChange
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerStatusChange = async (req, res) => {
    try {
        let updateBanner = {
            status: req.body.status
        };
        //console.log(updateBanner)
        await Vendorbanner.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.banner_id) }, updateBanner, { new: true });
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
        let record = await Vendorbanner.find({ "$or": [{ status: 'active' }, { status: 'pending' }], vendor_id: mongoose.Types.ObjectId(req.body.vendor_id) });
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


module.exports = {
    vendorList: vendorList,
    searchVendorList: searchVendorList,
    vendorCreate: vendorCreate,
    uploadVendordp: uploadVendordp,
    vendorDetails: vendorDetails,
    vendorUpdate: vendorUpdate,
    adminVendorStoreList: adminVendorStoreList,
    adminstoreDetails: adminstoreDetails,
    adminVendorDepartmentList: adminVendorDepartmentList,
    adminVendorDepartmentDetails: adminVendorDepartmentDetails,
    adminVendorRoomList: adminVendorRoomList,
    adminVendorProductList: adminVendorProductList,
    adminVendorProductSearch: adminVendorProductSearch,
    adminVendorTryonProductList: adminVendorTryonProductList,
    pendingProductList: pendingProductList,
    approveProductList: approveProductList,
    adminVendorProductUpdate: adminVendorProductUpdate,
    productActivation: productActivation,
    adminVendorProductStatusChange: adminVendorProductStatusChange,
    adminBulkVendorProductStatusChange: adminBulkVendorProductStatusChange,
    adminVendorProductDelete: adminVendorProductDelete,
    adminvendorOrderList: adminvendorOrderList,
    adminvendorOrderSearch: adminvendorOrderSearch,
    adminVendorOrderSearch: adminVendorOrderSearch,
    adminvendorOrderUpdate: adminvendorOrderUpdate,
    adminvendorOrderDetails: adminvendorOrderDetails,
    bannerStatusChange: bannerStatusChange,
    bannerList: bannerList,
}