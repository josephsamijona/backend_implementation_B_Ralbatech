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
const moment = require('moment')
var handlebars = require('handlebars');
var fs = require('fs');
const response = require("../../libs/responseLib");
const crypto = require("../../libs/passwordLib");
const otpLib = require("../../libs/otpLib");
const Otp = require('../../models/otpModel');
const JWT = require('../../libs/tokenLib');
const appConfig = require("../../../config/appConfig");
const sendemail = require("../../libs/sendmail");
// Import Model
const Vendor = require('../../models/vendorModel');
const StoreViews = require('../../models/storeViewModel');
const Admin = require('../../models/adminModel');
const Role = require('../../models/roleModel');
const adminSetting = require('../../models/adminSettingsModel')
const order = require('../../models/orderModel');
const OrderDetails = require('../../models/orderDetailsModel')
const Prducts = require('../../models/productModel')
const MasterModule = require('../../models/masterModules')
const SubAdminModule = require('../../models/subAminModules')
const ShippingTaxModel = require('../../models/shippingTaxModel')
const VendorShippingTaxModel = require('../../models/vendorShippingTaxModel')
const Userpasswordhistory = require('../../models/userPasswordHistoryModel')
const CommisionModule = require('../../models/commisionModule')
const mongoose = require('mongoose');
const Store = require('../../models/storeModel');
const genLib = require('../../libs/genLib');
const checkLib = require('../../libs/checkLib');
const Product = require('../../models/productModel');
const ReturnDurationModel = require('../../models/returnDurationModel')
const CouponModel = require('../../models/couponModel')


/**
    * @author Ankush Shome
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

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName transporter
    * @functionPurpose  
    *                                                   
    * @functionParam 
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
const transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAILPASS
    }
}));

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorLogin
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorLogin = async (req, res) => {
    try {
        let verify_pass = await crypto.verify(req.body.password, req.body.record.password);
        if (verify_pass) {
            let resObj = {
                vendor_id: req.body.record._id,
                name: req.body.record.name,
                email: req.body.record.email.toLowerCase(),
                phone: req.body.record.phone,
                role: { role_name: 'vendor' },
                vendor_type: req.body.record.vendor_type,
                is_copy: req.body.record.is_copy,
                main_vendor_id: req.body.record.main_vendor_id,
                vendor_type: req.body.record.vendor_type,
                profile_image: req.body.record.vendor_image
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorSignup
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let vendorSignup = async (req, res) => {

    let password = await crypto.hash(req.body.password)

    let newUser = new Vendor({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        password: password,
        vendor_type: 'main',
        status: 'active',
    });

    try {
        let venordetails = await newUser.save();

        let passwordcheckObj = new Userpasswordhistory({
            user_id: venordetails._id,
            previous_password: password,
        });
        passwordcheckObj.save();

        let userDetails = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
        }
        let option = {
            "template": `<h3>Hi ${req.body.name} !</h3><br/>
            <p>Welcome To Ralba Technologies 3D shopping platform
            </p><br/>
            <p>Regards,<br/>
            Ralba Technologies Team</p>`,
            "receiver_mail": [`${req.body.email}`],
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
            <p><b>Email :</b> ${req.body.email}
            </p><br/>
            <p><b>Phone :</b> ${req.body.phone}
            </p><br/>
            <p><b>Selected Categories :</b> ${req.body.catagories}
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminLogin
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminLogin = async (req, res) => {
    try {
        let verify_pass = await crypto.verify(req.body.password, req.body.record.password);
        if (verify_pass) {
            let resObj = {
                admin_id: req.body.record._id,
                name: req.body.record.name,
                email: req.body.record.email.toLowerCase(),
                role: req.body.record.role,
                profile_image: req.body.record.admin_image
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminCreate = async (req, res) => {

    try {

        let password = await crypto.hash(req.body.password);
        let newAdmin = new Admin({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            admin_image: '',
            password: password,
            status: 'active',
            role: {
                _id: req.body.role_id
            }

        });

        let recordcount = await Admin.findOne({ email: req.body.email.toLowerCase() }).count();
        if (recordcount > 0) {
            let apiResponse = response.generate(0, ` Email or phone already exists`, {});
            res.status(410);
            res.send(apiResponse);
        } else {
            let adminRecord = await newAdmin.save();

            let passwordcheckObj = new Userpasswordhistory({
                user_id: adminRecord._id,
                previous_password: password,
            });
            passwordcheckObj.save();
            let apiResponse = response.generate(0, ` Success`, adminRecord);
            res.status(200);
            res.send(apiResponse)
        }


    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName sendEmailRegistration
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let sendEmailRegistration = (options) => {
    return new Promise((resolve, reject) => {
        ////console.log(dirname(require.main.filename));
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
    * @functionName addSetting
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let addSetting = async (req, res) => {
    try {

        let newupdateSettingsAdmin = new adminSetting({
            addto_cart_status: req.body.addto_cart_status,
            quentity_status: req.body.quentity_status
        });
        await newupdateSettingsAdmin.save();
        let apiResponse = response.generate(0, ` Success`, newupdateSettingsAdmin);
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
    * @functionName updateSetting
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let updateSetting = async (req, res) => {
    try {
        let updateSettings = {
            addto_cart_status: req.body.addto_cart_status,
            quentity_status: req.body.quentity_status
        };
        await adminSetting.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.settings_id) }, updateSettings, { new: false });
        let apiResponse = response.generate(0, ` Success`, updateSettings);
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
    * @functionName detailsSetting
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let detailsSetting = async (req, res) => {
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
    * @function async
    * @functionName vendorDeatils
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorDeatils = async (req, res) => {

    try {
        let record = await Vendor.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.vendor_id) });

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
    * @functionName adminDeatils
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminDeatils = async (req, res) => {

    try {
        let record = await Admin.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.admin_id) });

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
    * @functionName subadminDeatils
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let subadminDeatils = async (req, res) => {

    try {
        let record = await Admin.find({ _id: mongoose.Types.ObjectId(req.body.subadmin_id) });
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
    * @functionName subadminlist
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let subadminlist = async (req, res) => {
    // Default values for pagination if not provided
    let page = parseInt(req.query.page) || 1;  // Current page, defaults to 1
    let limit = parseInt(req.query.limit) || 10;  // Limit per page, defaults to 10

    try {
        // Get the sub-admins excluding the one with admin_id equal to req.user.admin_id
        let query = { _id: { $ne: req.user.admin_id } };

        // Find sub-admins with pagination
        let subadminList = await Admin.find(query)
            .skip((page - 1) * limit)  // Skip records based on page number
            .limit(limit)  // Limit the number of records to fetch
            .lean();  // Use lean to get plain JavaScript objects for better performance

        // Count total documents that match the query (for pagination)
        let totalRecords = await Admin.countDocuments(query);

        // Prepare the response object with the paginated data and total count
        let apiResponse = response.generate(0, `Success`, {
            subadminList,
            totalRecords
        });

        // Send the response
        res.status(200).send(apiResponse);
    } catch (err) {
        // Error handling
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName subadminSearch
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let subadminSearch = async (req, res) => {
    // Default values for pagination if not provided
    let page = parseInt(req.query.page) || 1;  // Current page, defaults to 1
    let limit = parseInt(req.query.limit) || 10;  // Limit per page, defaults to 10

    try {

        let searchValue = req.query.search || "";
        let query = {
            _id: { $ne: req.user.admin_id },
            $or: [
                { name: { $regex: searchValue, $options: "i" } },
                { email: { $regex: searchValue, $options: "i" } }
            ]
        };

        // Find sub-admins with pagination and search query
        let subadminList = await Admin.find(query)
            .skip((page - 1) * limit)  // Skip records based on page number
            .limit(limit)  // Limit the number of records to fetch
            .lean();  // Use lean to get plain JavaScript objects for better performance

        // Count total documents that match the query (for pagination)
        let totalRecords = await Admin.countDocuments(query);

        // Prepare the response object with the paginated data, search results, and total count
        let apiResponse = response.generate(0, `Success`, {
            subadminList,
            totalRecords
        });

        // Send the response
        res.status(200).send(apiResponse);
    } catch (err) {
        // Error handling
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorDashboardFilter
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorDashboardFilter = async (req, res) => {
    try {
        let order_ids = [];
        let numberofstoreView;
        let numberofPurchase;
        let numberofProducts;
        let orderdetailsdb_record;

        const vendor_id = mongoose.Types.ObjectId(req.user.vendor_id);
        let vendor_details = await Vendor.findOne({ "_id": vendor_id })
        // Date filter condition
        const dateCondition = req.body.from_date != "" && req.body.to_date
            ? { createdAt: { $gte: req.body.from_date, $lt: moment(req.body.to_date, "YYYY-MM-DD").add(1, 'days') } }
            : {};

        // Count store views, purchases, and products for the vendor (using vendor_id or access_vendor_id)
        numberofstoreView = await StoreViews.countDocuments({ vendor_id, ...dateCondition });
        numberofPurchase = await OrderDetails.countDocuments({
            $or: [
                { vendor_id }, // Match main vendor
                { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
            ],
            ...dateCondition
        });
        numberofProducts = await Prducts.countDocuments({ status: 'active', product_owner: vendor_details.is_copy ? vendor_details.main_vendor_id : vendor_details._id, ...dateCondition });

        // Fetch order details (main vendor or access vendor orders)
        orderdetailsdb_record = await OrderDetails.find({
            $or: [
                { vendor_id }, // Match main vendor
                { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
            ],
            ...dateCondition
        });

        // Collect order_ids
        for (odlist of orderdetailsdb_record) {
            if (!order_ids.includes(String(odlist.order_id))) {
                order_ids.push(String(odlist.order_id));
            }
        }

        // Convert order_ids to ObjectId array
        let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // Fetch order details using aggregation
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
                    "order_details.options": 1,
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

        // Calculate total order amount
        let total_order_amount = orderdetails_record.reduce((prev, curr) => prev + curr.total_order_amount, 0);

        // Prepare dashboard details
        let dashboard_details = {
            number_of_store: numberofstoreView,
            total_purchase: numberofPurchase,
            number_of_product: numberofProducts,
            total_order_amount: total_order_amount
        };

        // Send the response
        let apiResponse = response.generate(0, `Success`, dashboard_details);
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
    * @function async
    * @functionName dashboardfilter
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let dashboardfilter = async (req, res) => {
    try {
        let order_ids = [];
        let numberofstoreVIew;
        let numberofPurchase;
        let numberofProducts;
        let orderdetailsdb_record;
        let vendor_details

        const vendor_id = req.body.vendor_id ? mongoose.Types.ObjectId(req.body.vendor_id) : null;
        if (vendor_id) {
            vendor_details = await Vendor.findOne({ "_id": vendor_id });
        }
        // Date filter condition using ISODate format for accuracy
        const dateCondition = req.body.from_date != "" && req.body.to_date
            ? { createdAt: { $gte: new Date(req.body.from_date + "T00:00:00.000Z"), $lt: new Date(moment(req.body.to_date).add(1, 'days').format("YYYY-MM-DD") + "T00:00:00.000Z") } }
            : {};

        if (req.body.from_date === "" && req.body.to_date === "" && req.body.vendor_id === "") {
            // No filters applied
            numberofstoreVIew = await StoreViews.countDocuments();
            numberofPurchase = await OrderDetails.countDocuments();
            numberofProducts = await Prducts.countDocuments({ status: 'active' });
            orderdetailsdb_record = await OrderDetails.find();
        } else {
            if (req.body.from_date !== "" && req.body.to_date !== "" && req.body.vendor_id != null) {
                // Date range and vendor filter applied
                const vendorObjId = mongoose.Types.ObjectId(req.body.vendor_id);
                numberofstoreVIew = await StoreViews.countDocuments({ vendor_id: vendorObjId, ...dateCondition });
                numberofPurchase = await OrderDetails.countDocuments({
                    $or: [
                        { vendor_id }, // Match main vendor
                        { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
                    ],
                    ...dateCondition
                });
                numberofProducts = await Prducts.countDocuments({ status: 'active', product_owner: vendor_details.is_copy ? vendor_details.main_vendor_id : vendor_details._id, ...dateCondition });
                orderdetailsdb_record = await OrderDetails.find({
                    $or: [
                        { vendor_id }, // Match main vendor
                        { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
                    ],
                    ...dateCondition
                });
            } else if (req.body.from_date === "" && req.body.to_date === "" && req.body.vendor_id != null) {
                // Vendor filter only
                const vendorObjId = mongoose.Types.ObjectId(req.body.vendor_id);
                numberofstoreVIew = await StoreViews.countDocuments({ vendor_id: vendorObjId });
                numberofPurchase = await OrderDetails.countDocuments({
                    $or: [
                        { vendor_id }, // Match main vendor
                        { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
                    ]
                });
                numberofProducts = await Prducts.countDocuments({ status: 'active', product_owner: vendor_details.is_copy ? vendor_details.main_vendor_id : vendor_details._id });
                orderdetailsdb_record = await OrderDetails.find({
                    $or: [
                        { vendor_id }, // Match main vendor
                        { 'commission_details.breakdownPercentage.access_vendor_id': vendor_id } // Match access vendor
                    ]
                });
            } else if (req.body.from_date !== "" && req.body.to_date !== "" && req.body.vendor_id == null) {
                // Date range only, no vendor filter
                numberofstoreVIew = await StoreViews.countDocuments({ ...dateCondition });
                numberofPurchase = await OrderDetails.countDocuments({ ...dateCondition });
                numberofProducts = await Prducts.countDocuments({ status: 'active', ...dateCondition });
                orderdetailsdb_record = await OrderDetails.find({ ...dateCondition });
            }
        }

        // Collect unique order IDs from order details
        for (let odlist of orderdetailsdb_record) {
            if (!order_ids.includes(String(odlist.order_id))) {
                order_ids.push(String(odlist.order_id));
            }
        }

        let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // Aggregate order details with lookups
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
                    "order_details.options": 1,
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

        let total_order_amount = orderdetails_record.reduce((prev, curr) => prev + curr.total_order_amount, 0);

        let dashboard_details = {
            number_of_store: numberofstoreVIew,
            total_purchase: numberofPurchase,
            number_of_product: numberofProducts,
            total_order_amount: total_order_amount
        };

        let apiResponse = response.generate(0, `Success`, dashboard_details);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminForgotPassword
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminForgotPassword = async (req, res) => {

    try {
        let auto_gen_password = otpLib.generatePassword(8)
        let new_password = await crypto.hash(auto_gen_password);
        let record = await Admin.find({ status: 'active', email: req.body.email });
        if (record.length > 0) {
            let newUser = {
                password: new_password
            };
            let userrecord = await Admin.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
            let option = {
                "template": `<h3>Hi ${userrecord.name} !</h3><br/>
            <p>Your New Password is : ${auto_gen_password}
            </p><br/>
            <p>Regards,<br/>
            Ralba Technologies Team</p>`,
                "receiver_mail": [`${userrecord.email}`],
                "subject": `Ralba Technologies : Forgot Password`

            }
            sendemail.sendMailFunc(option);
            //console.log('Auto Generate Password', auto_gen_password);
            let apiResponse = response.generate(0, ` Success`, record);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, ` Your mail not register to our system`, {});
            res.status(410);
            res.send(apiResponse)
        }
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
    * @functionName vendorgenerateOtp
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorgenerateOtp = async (req, res) => {

    let otpval = otpLib.generateOtpDigit(4)
    let newOtp = new Otp({
        phone: req.body.phone,
        otpValue: otpval,
        otpType: req.body.type
    })
    console.log("newotp:"+newOtp);
    try { 
        await newOtp.save((err, newOtp) => {

            //Send OTP Template

            let option = {
                "template": `<h3>Hi ${req.body.name} !</h3><br/>
                <p>Your Sign Up OTP is:${otpval}
                </p><br/>
                <p>Regards,<br/>
                Ralba Technologies Team</p>`,
                "receiver_mail": [`${req.body.email}`],
                "subject": `Ralba Technologies : Sign Up OTP Details`

            }
            sendemail.sendMailFunc(option);

            //console.log('success');
            let apiResponse = response.generate(0, ` Success`, newOtp);
            res.status(200);
            res.send(apiResponse);
        })
    } catch (err) {
        //console.log(err);
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
    * @functionName subadminupdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let subadminupdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedSubadmin = {};

        for (const property in reqbody) {
            updatedSubadmin[property] = reqbody[property];
        }
        await Admin.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.subadmin_id) }, updatedSubadmin, { new: true });

        if (req.body.status) {
            let statusupdate = {
                status: req.body.status
            }
            await SubAdminModule.findOneAndUpdate({ subadmin_id: mongoose.Types.ObjectId(req.body.subadmin_id) }, statusupdate, { new: true });
        }

        let apiResponse = response.generate(0, ` Success`, updatedSubadmin);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        if (err.code === 11000) {
            // Handle duplicate key error
            let apiResponse = response.generate(1, ` Phone number already in use`, {});
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
    * @functionName adminCreateModule
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminCreateModule = async (req, res) => {

    try {
        let newModule = new MasterModule({
            module_name: req.body.module_name,
            status: 'active',
        });

        let adminRecord = await newModule.save();
        let apiResponse = response.generate(0, ` Success`, adminRecord);
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
    * @functionName adminListModule
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminListModule = async (req, res) => {

    try {
        let record = await MasterModule.find({ status: 'active' });
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
    * @functionName assignModule
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let assignModule = async (req, res) => {

    try {
        let adminRecord = '';

        let record = await SubAdminModule.countDocuments({ subadmin_id: req.body.subadmin_id, module_id: req.body.module_id });
        let newModule = new SubAdminModule({
            module_id: req.body.module_id,
            subadmin_id: req.body.subadmin_id,
        });

        if (record > 0) {
            adminRecord = await SubAdminModule.deleteOne({ subadmin_id: req.body.subadmin_id, module_id: req.body.module_id });
        } else {
            adminRecord = await newModule.save();
        }

        let apiResponse = response.generate(0, ` Success`, adminRecord);
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
    * @functionName listsubadminmodule
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let listsubadminmodule = async (req, res) => {

    try {
        let record = await SubAdminModule.find({ subadmin_id: req.body.subadmin_id });
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
    * @functionName vendorForgotPassword
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorForgotPassword = async (req, res) => {

    try {
        let auto_gen_password = otpLib.generatePassword(8)
        let new_password = await crypto.hash(auto_gen_password);
        let record = await Vendor.find({ status: 'active', email: req.body.email.toLowerCase() });
        //console.log('record', record);
        if (record.length > 0) {
            let newUser = {
                password: new_password
            };
            let userrecord = await Vendor.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
            let option = {
                "template": `<h3>Hi ${userrecord.name} !</h3><br/>
                <p>Your New Password is : ${auto_gen_password}
                </p><br/>
                <p>Regards,<br/>
                Ralba Technologies Team</p>`,
                "receiver_mail": [`${userrecord.email}`],
                "subject": `Ralba Technologies : Forgot Password`

            }
            sendemail.sendMailFunc(option);
            //console.log('Auto Generate Password', auto_gen_password);
            let apiResponse = response.generate(0, ` Success`, record);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, ` Your mail not register to our system`, {});
            res.status(410);
            res.send(apiResponse)
        }


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
    * @functionName vendorChangePassword
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorChangePassword = async (req, res) => {

    try {
        let record = await Vendor.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.vendor_id) });

        let verify_pass = await crypto.verify(req.body.old_Password, record[0].password);
        if (verify_pass) {
            let password = await crypto.hash(req.body.new_Password)
            let newUser = {
                password: password
            };
            let userrecord = await Vendor.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
            let updatePassword =
            {
                previous_password: password
            }
            let findUPH = await Userpasswordhistory.find({ user_id: mongoose.Types.ObjectId(req.user.vendor_id) })
            if (findUPH) {
                await Userpasswordhistory.findOneAndUpdate({ user_id: mongoose.Types.ObjectId(req.user.vendor_id) }, updatePassword, { new: false });
            }



            // let option = {
            //     "template": `<h3>Hi ${userrecord.name} !</h3><br/>
            //     <p>Your Password has been Changed. You can login now with new Password : ${req.body.new_Password}
            //     </p><br/>
            //     <p>Regards,<br/>
            //     Ralba Technologies Team</p>`,
            //     "receiver_mail": [`${userrecord.email}`],
            //     "subject": `Ralba Technologies : Login Vendor Password Change`

            // }
            // sendemail.sendMailFunc(option);

            //console.log('Password change User', userrecord);

            let apiResponse = response.generate(0, ` Success`, newUser);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, ` Your Old Password does not match, Please check once`, {});
            res.status(410);
            res.send(apiResponse)
        }
        //console.log('Pasword', record[0].email);

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
    * @functionName checkSamePasswordVendor
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let checkSamePasswordVendor = async (req, res) => {

    try {
        let record = await Userpasswordhistory.find({ user_id: mongoose.Types.ObjectId(req.user.vendor_id) });
        if (record.length > 0) {
            let verify_pass = await crypto.verify(req.body.current_Password, record[0].previous_password);
            if (verify_pass) {

                let apiResponse = response.generate(1, ` Please use different password . This password is already being used earlier.`, '');
                res.status(410);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(0, `Success`, 'New password available');
                res.status(200);
                res.send(apiResponse)
            }
        }
        else {
            let apiResponse = response.generate(0, `Success`, 'Your password is not saved');
            res.status(200);
            res.send(apiResponse)
        }

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
    * @functionName checkSamePasswordAdmin
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let checkSamePasswordAdmin = async (req, res) => {

    try {
        let record = await Userpasswordhistory.find({ user_id: mongoose.Types.ObjectId(req.user.admin_id) });
        if (record.length > 0) {
            let verify_pass = await crypto.verify(req.body.current_Password, record[0].previous_password);
            if (verify_pass) {

                let apiResponse = response.generate(1, ` Please use different password . This password is already being used earlier.`, '');
                res.status(410);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(0, `Success`, 'New password available');
                res.status(200);
                res.send(apiResponse)
            }
        }
        else {
            let apiResponse = response.generate(0, `Success`, 'Your password is not saved');
            res.status(200);
            res.send(apiResponse)
        }
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
    * @functionName adminChangePassword
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminChangePassword = async (req, res) => {

    try {
        let record = await Admin.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.admin_id) });

        let verify_pass = await crypto.verify(req.body.old_Password, record[0].password);
        if (verify_pass) {
            let password = await crypto.hash(req.body.new_Password)
            let newUser = {
                password: password
            };
            let userrecord = await Admin.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
            let updatePassword =
            {
                previous_password: password
            }
            let findUPH = await Userpasswordhistory.find({ user_id: mongoose.Types.ObjectId(req.user.admin_id) })
            if (findUPH) {
                await Userpasswordhistory.findOneAndUpdate({ user_id: mongoose.Types.ObjectId(req.user.admin_id) }, updatePassword, { new: false });
            }
            // let option = {
            //     "template": `<h3>Hi ${userrecord.name} !</h3><br/>
            //     <p>Your Password has been Changed. You can login now with new Password : ${req.body.new_Password}
            //     </p><br/>
            //     <p>Regards,<br/>
            //     Ralba Technologies Team</p>`,
            //     "receiver_mail": [`${userrecord.email}`],
            //     "subject": `Ralba Technologies : Login Admin Password Change`

            // }
            // sendemail.sendMailFunc(option);

            //console.log('Password change User', userrecord);

            let apiResponse = response.generate(0, ` Success`, newUser);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, ` Your Old Password does not match, Please check once`, {});
            res.status(410);
            res.send(apiResponse)
        }
        //console.log('Pasword', record[0].email);

    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
    * @author Md Mustakim Sarkar
    * @Date_Created 18-07-2023
    * @Date_Modified  
    * @function async
    * @functionName adminOrderUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminOrderUpdate = async (req, res) => {
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
    * @author Md Mustakim Sarkar
    * @Date_Created 18-07-2023
    * @Date_Modified  
    * @function async
    * @functionName adminOrderDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminOrderDetails = async (req, res) => {
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
                    "updatedAt": 1

                }
            }
        ]);

        //console.log('Order Data', orderdetails_record);

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


let adminReturnOrderList = async (req, res) => {
    // console.log("adminReturnOrderList called");
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let order_ids = [];
        // let vendorDetails = await vendorModel.findOne({ _id: mongoose.Types.ObjectId(req.user.vendor_id) });
        // let vendor_id = vendorDetails.is_copy ? vendorDetails.main_vendor_id : vendorDetails._id;

        // console.log('vendorDetails---', vendorDetails);
        // Fetch all order details for the vendor
        // let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(vendor_id) });
        // let orderdetailsdb_record2 = await orderdetails.find({ "commission_details.breakdownPercentage.access_vendor_id": mongoose.Types.ObjectId(req.user.vendor_id) });

        // if (vendorDetails.is_copy) {
        //     for (odlist of orderdetailsdb_record2) {
        //         if (!order_ids.includes(String(odlist.order_id))) {
        //             order_ids.push(String(odlist.order_id));
        //         }
        //     }
        // }
        // if (!vendorDetails.is_copy) {
        //     for (odlist of orderdetailsdb_record) {
        //         if (!order_ids.includes(String(odlist.order_id))) {
        //             order_ids.push(String(odlist.order_id));
        //         }
        //     }
        // }

        // let ids = order_ids.map(odidlist => mongoose.Types.ObjectId(odidlist));

        // Fetch all matching order details (before pagination)
        let orderdetails_record = await order.aggregate([
            {
                $match: {
                    order_status: { $in: ['return requested', 'return approved', 'return in transit', 'return received', 'refunded'] }
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
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName adminshippingTax
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminshippingTax = async (req, res) => {

    try {
        let updateshippingTaxData
        let shippingDeatils = await ShippingTaxModel.find({})
        if (checkLib.isEmpty(shippingDeatils)) {

            let shippingObj = ShippingTaxModel({
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            })

            updateshippingTaxData = await shippingObj.save();
        }
        else {
            let updateshippingTax = {
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            }
            updateshippingTaxData = await ShippingTaxModel.findOneAndUpdate({}, updateshippingTax, { new: true });

        }

        let apiResponse = response.generate(0, ` Success`, updateshippingTaxData);
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
    * @functionName vendorshippingTax
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorshippingTax = async (req, res) => {

    try {
        let vendorshippingData
        let vendorShippingDeatils = await VendorShippingTaxModel.find({ vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) })
        if (checkLib.isEmpty(vendorShippingDeatils)) {
            let vendorshippingObj = VendorShippingTaxModel({
                vendor_id: req.user.vendor_id,
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            })

            vendorshippingData = await vendorshippingObj.save();
        }
        else {
            let updateshippingTax = {
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            }
            vendorshippingData = await VendorShippingTaxModel.findOneAndUpdate({ vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) }, updateshippingTax, { new: true });

        }


        let apiResponse = response.generate(0, ` Success`, vendorshippingData);
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
    * @functionName adminVendorshippingTax
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminVendorshippingTax = async (req, res) => {
    try {
        let shippingData
        if (req.user.role['role_name'] == 'admin') {
            shippingData = await ShippingTaxModel.find({})
        }
        else {
            shippingData = await VendorShippingTaxModel.find({ vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) }).lean();

            if (checkLib.isEmpty(shippingData)) {
                shippingData = await ShippingTaxModel.find({})
            }
        }

        let apiResponse = response.generate(0, ` Success`, shippingData);
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
    * @functionName commissionSetup
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let commissionSetup = async (req, res) => {
    try {
        let commisionData = await CommisionModule.findOne();

        if (!commisionData) {  // If commission data is empty, create a new one
            let commissionObj = new CommisionModule({
                platform_charge: req.body.platform_charge,  // Use req.body for platform_charge
                vendor_charges: req.body.vendor_charges
            });

            commisionData = await commissionObj.save();
        } else {  // If commission data exists, update it
            let updateCommission = {
                platform_charge: req.body.platform_charge,  // Use req.body for platform_charge
                vendor_charges: req.body.vendor_charges
            };

            commisionData = await CommisionModule.findOneAndUpdate(
                { _id: commisionData._id },  // Use the _id from the existing document to update the same record
                updateCommission,
                { new: true }  // Return the updated document
            );
        }

        // Generate success response
        let apiResponse = response.generate(0, 'Success', commisionData);  // Return the updated or created commission data
        res.status(200).send(apiResponse);

    } catch (err) {
        // Generate error response
        let apiResponse = response.generate(1, `${err.message}`, {});  // Use status 1 for error
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName getCommissionDeatils
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let getCommissionDeatils = async (req, res) => {
    try {
        let commisionData
        if (req.user.role['role_name'] == 'admin') {
            commisionData = await CommisionModule.find({})
        }
        let apiResponse = response.generate(0, ` Success`, commisionData);
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
    * @Date_Created 15/01/2025
    * @Date_Modified  15/01/2025
    * @function async
    * @functionName copyVendorlist
    * @functionPurpose  all main vendor list those vendors store can copy. 
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let copyVendorlist = async (req, res) => {
    try {
        // Fetch page and limit from query params, with default values
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 5;

        // Fetch active stores with 'store_owner' and 'store_slug' fields
        let activeStores = await Store.find({ status: 'active' }, { store_owner: 1, store_slug: 1 }).lean();

        // Extract the store owner IDs from the active stores (assuming these correspond to vendor IDs)
        let storeVendorIds = activeStores.map(store => store.store_owner);

        if (storeVendorIds.length === 0) {
            return res.status(200).send(response.generate(0, 'No vendors found', []));
        }

        // Fetch the total count of vendors before applying pagination
        const totalVendors = await Vendor.countDocuments({
            _id: { $in: storeVendorIds },
            is_copy: false,
            status: 'active'
        });

        // Fetch vendors with matching store_owner IDs and other conditions, using projection to reduce the returned fields
        const vendorList = await Vendor.find(
            {
                _id: { $in: storeVendorIds },
                is_copy: false,
                status: 'active'
            },
            { _id: 1, name: 1, createdAt: 1 } // Only return necessary fields
        )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) // Apply pagination using skip
            .limit(limit)             // Limit results
            .lean();

        // Map vendorList with the corresponding store_slug
        const vendorListWithStoreSlug = vendorList.map(vendor => {
            const store = activeStores.find(store => String(store.store_owner) === String(vendor._id));
            return { ...vendor, store_slug: store ? store.store_slug : null };
        });

        // Prepare API response with vendor list, store_slug, and pagination details
        let apiResponse = response.generate(0, 'Success', {
            vendorList: vendorListWithStoreSlug,
            totalVendors
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
    * @functionName adminCommissionSetup
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let adminCommissionSetup = async (req, res) => {

    try {
        let updateshippingTaxData
        let shippingDeatils = await ShippingTaxModel.find({})
        if (checkLib.isEmpty(shippingDeatils)) {

            let shippingObj = ShippingTaxModel({
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            })

            updateshippingTaxData = await shippingObj.save();
        }
        else {
            let updateshippingTax = {
                shipping_charge: req.body.shipping_charge,
                tax_percentage: req.body.tax_percentage,
            }
            updateshippingTaxData = await ShippingTaxModel.findOneAndUpdate({}, updateshippingTax, { new: true });

        }

        let apiResponse = response.generate(0, `Success`, updateshippingTaxData);
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
    * @functionName requestFor3dAsset
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let requestFor3dAsset = async (req, res) => {
    try {

        let vendorDeatils = await Vendor.findOne({ _id: mongoose.Types.ObjectId(req.body.vendor_id) });
        let mainVendorDeatils
        if (vendorDeatils.vendor_type == 'access') {
            mainVendorDeatils = await Vendor.findOne({ _id: mongoose.Types.ObjectId(vendorDeatils.main_vendor_id) });
        }
        let VendorProposal = {
            "template": `<h3>Hi!</h3><br/><p>I am ${req.body.vendor_type} Vendor of Ralba Technologies. I want to Request 
            a 3D Asset for this product. Please find the details below:</p><br/>
            <p>Product Name: ${req.body.product_name}</p>
            <p>Vendor Name: ${req.body.vendor_name}</p>
            <p>Main Vendor Name: ${req.body.vendor_type == 'access' ? mainVendorDeatils.name : vendorDeatils.name}</p>
            <br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`],
            "subject": `Ralba Technologies : Request 3D asset for product - ${req.body.product_name}`
        }
        sendemail.sendMailFunc(VendorProposal);
        let apiResponse = response.generate(0, `Request for 3D Asset Mail Send Successfully`, {});
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let adminReturnDuration = async (req, res) => {

    try {
        let updateReturnDurationData;
        let returnDurationDeatils = await ReturnDurationModel.find({})
        if (checkLib.isEmpty(returnDurationDeatils)) {

            let returnDurationObj = ReturnDurationModel({
                return_duration: req.body.return_duration,
            })

            updateReturnDurationData = await returnDurationObj.save();
        }
        else {
            let updateReturnDuration = {
                return_duration: req.body.return_duration,
            }
            updateReturnDurationData = await ReturnDurationModel.findOneAndUpdate({}, updateReturnDuration, { new: true });
        }

        let apiResponse = response.generate(0, `Success`, updateReturnDurationData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let getReturnDuration = async (req, res) => {
    try {
        let returnDurationData = await ReturnDurationModel.findOne({});
        let apiResponse = response.generate(0, `Success`, returnDurationData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let adminCouponAdd = async (req, res) => {

    try {

        const generateCouponCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 9; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };


        const {
            coupon_name,
            type,
            discount,
            min_order_amount,
            per_user_limit,
            start_date,
            end_date,
            description
        } = req.body;

        // Convert dates
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const now = new Date();

        // Validate date logic
        if (endDateObj <= startDateObj) {
            return res.status(200).send(response.generate(0, 'End date must be greater than start date', []));
        }

        // Check if same coupon name exists for active & non-expired coupon
        const existingCoupon = await CouponModel.findOne({
            coupon_name: coupon_name.toUpperCase(),
            is_active: true,
            end_date: { $gte: now }
        });

        if (existingCoupon) {
            return res.status(200).send(response.generate(0, 'An active, non-expired coupon with same coupon name already exists', []));
        }

        // Generate UNIQUE coupon code
        let couponCode;
        let isCodeExists = true;

        while (isCodeExists) {
            couponCode = generateCouponCode();
            const codeCheck = await CouponModel.findOne({ coupon_code: couponCode });
            if (!codeCheck) isCodeExists = false;
        }

        // Create new coupon
        const newCoupon = new CouponModel({
            coupon_name: coupon_name.toUpperCase(),
            coupon_code: couponCode,
            type: type.toLowerCase(),
            discount,
            min_order_amount: min_order_amount || 0,
            per_user_limit: per_user_limit || 1,
            start_date: startDateObj,
            end_date: endDateObj,
            description,
            is_active: true
        });

        const savedCoupon = await newCoupon.save();




        let apiResponse = response.generate(0, `Success`, savedCoupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let couponDetails = async (req, res) => {
    try {

        const formatDate = (date) => {
            if (!date) return null;
            return date.toISOString().split("T")[0];
        };

        let record = await CouponModel.findOne({ _id: mongoose.Types.ObjectId(req.body.coupon_id) }).lean();

        const formattedCoupon = {
            ...record,
            start_date: formatDate(record.start_date),
            end_date: formatDate(record.end_date),
        };


        let apiResponse = response.generate(0, ` Success`, formattedCoupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let couponSearchList = async (req, res) => {

    let search = req.query.search || ''; // Extract search query from request params

    try {
        // Build search condition for name, email, and phone
        let searchCondition = {
            $or: [
                { coupon_name: { $regex: search, $options: 'i' } },
                { coupon_code: { $regex: search, $options: 'i' } },
            ]
        };

        // Find coupons based on the search condition, paginate and sort by creation date
        const couponlist = await CouponModel.find(searchCondition)
            .sort({ createdAt: -1 })
            .lean();

        // Get total user count that matches the search condition
        const totalcoupons = await CouponModel.countDocuments(searchCondition);

        // Send response with paginated users and total count
        let apiResponse = response.generate(0, `Success`, { couponlist, totalcoupons });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


let adminCouponUpdate = async (req, res) => {

    try {

        let couponId = req.params.id;

        const {
            coupon_name,
            type,
            discount,
            min_order_amount,
            per_user_limit,
            start_date,
            end_date,
            description
        } = req.body;


        // Convert dates
        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);
        const now = new Date();

        // Validate date logic
        if (endDateObj <= startDateObj) {
            return res.status(200).send(response.generate(0, 'End date must be greater than start date', []));
        }

        // Check if same coupon name exists for active & non-expired coupon
        const existingCoupon = await CouponModel.findOne({
            coupon_name: coupon_name.toUpperCase(),
            is_active: true,
            end_date: { $gte: now }
        });

        if (existingCoupon && existingCoupon._id.toString() !== couponId) {
            return res.status(200).send(response.generate(0, 'An active, non-expired coupon with same coupon name already exists', []));
        }

        let updatedCouponData = {
            coupon_name: coupon_name.toUpperCase(),
            type: type.toLowerCase(),
            discount,
            min_order_amount: min_order_amount || 0,
            per_user_limit: per_user_limit || 1,
            start_date: startDateObj,
            end_date: endDateObj,
            description,
        }

        const savedCoupon = await CouponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(couponId) }, updatedCouponData, { new: true });

        let apiResponse = response.generate(0, `Success`, savedCoupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let adminCouponList = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    try {
        const couponlist = await CouponModel.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalCoupons = await CouponModel.countDocuments();

        let apiResponse = response.generate(0, ` Success`, { couponlist, totalCoupons });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}



let CouponStatusChange = async (req, res) => {
    try {
        let updatedCoupon = { is_active: req.body.is_active };
        await CouponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.coupon_id) }, updatedCoupon, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedCoupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let CouponwebsiteViewStatusChange = async (req, res) => {
    try {
        let updatedCoupon = { website_view: req.body.website_view };
        await CouponModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.coupon_id) }, updatedCoupon, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedCoupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


module.exports = {
    vendorLogin: vendorLogin,
    vendorgenerateOtp: vendorgenerateOtp,
    vendorSignup: vendorSignup,
    vendorForgotPassword: vendorForgotPassword,
    vendorChangePassword: vendorChangePassword,
    checkSamePasswordVendor: checkSamePasswordVendor,
    checkSamePasswordAdmin: checkSamePasswordAdmin,
    vendorDeatils: vendorDeatils,
    vendorDashboardFilter: vendorDashboardFilter,
    dashboardfilter: dashboardfilter,
    adminForgotPassword: adminForgotPassword,
    adminChangePassword: adminChangePassword,
    adminLogin: adminLogin,
    adminCreate: adminCreate,
    adminCreateModule: adminCreateModule,
    adminListModule: adminListModule,
    listsubadminmodule: listsubadminmodule,
    assignModule: assignModule,
    adminDeatils: adminDeatils,
    subadminDeatils: subadminDeatils,
    subadminupdate: subadminupdate,
    subadminlist: subadminlist,
    subadminSearch: subadminSearch,
    updateSetting: updateSetting,
    addSetting: addSetting,
    detailsSetting: detailsSetting,
    adminOrderUpdate: adminOrderUpdate,
    adminOrderDetails: adminOrderDetails,
    adminshippingTax: adminshippingTax,
    vendorshippingTax: vendorshippingTax,
    adminVendorshippingTax: adminVendorshippingTax,
    commissionSetup: commissionSetup,
    getCommissionDeatils: getCommissionDeatils,
    copyVendorlist: copyVendorlist,
    adminCommissionSetup: adminCommissionSetup,
    requestFor3dAsset: requestFor3dAsset,
    adminReturnDuration: adminReturnDuration,
    getReturnDuration: getReturnDuration,
    adminReturnOrderList: adminReturnOrderList,
    adminCouponAdd: adminCouponAdd,
    adminCouponList: adminCouponList,
    CouponStatusChange: CouponStatusChange,
    adminCouponUpdate: adminCouponUpdate,
    couponDetails: couponDetails,
    couponSearchList: couponSearchList,
    CouponwebsiteViewStatusChange: CouponwebsiteViewStatusChange
}