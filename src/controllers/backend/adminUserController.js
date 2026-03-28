/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note:  admin user control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */



const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { dirname } = require('path');

var handlebars = require('handlebars');
var fs = require('fs');

const response = require("../../libs/responseLib");
const crypto = require("../../libs/passwordLib");
const JWT = require('../../libs/tokenLib');
const appConfig = require("../../../config/appConfig");

// Import Model
const Vendor = require('../../models/vendorModel');
const Admin = require('../../models/adminModel');
const Role = require('../../models/roleModel');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Store = require('../../models/storeModel');
const order = require('../../models/orderModel');
const orderdetails = require('../../models/orderDetailsModel');
const payment = require('../../models/paymentDetailsModel');
const CouponUsageModel = require('../../models/couponUsageModel')
const CouponModel = require('../../models/couponModel')

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

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName transporter
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
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
    * @author Munnaf Hossain Mondal
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
    * @functionName userList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userList = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    try {
        // let vendorList = await User.find().sort({ createdAt: -1 }).lean();

        const userlist = await User.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalUsers = await User.countDocuments();

        let apiResponse = response.generate(0, ` Success`, { userlist, totalUsers });
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
    * @functionName userSearchList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userSearchList = async (req, res) => {

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

        // Find users based on the search condition, paginate and sort by creation date
        const userlist = await User.find(searchCondition)
            .sort({ createdAt: -1 })
            .lean();

        // Get total user count that matches the search condition
        const totalUsers = await User.countDocuments(searchCondition);

        // Send response with paginated users and total count
        let apiResponse = response.generate(0, `Success`, { userlist, totalUsers });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName uploadUserrdp
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadUserrdp = async (req, res, next) => {
    let file = req.files;
    let fileUrl = {
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
    * @functionName userCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userCreate = async (req, res) => {
    try {
        let password = await crypto.hash(req.body.password);

        let newUser = new User({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
            password: password
        });

        await newUser.save();

        let userDetails = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
        };

        // Make sure to await the sendEmailRegistration and handle its errors
        await sendEmailRegistration(userDetails);

        let apiResponse = response.generate(0, 'Success', userDetails);
        res.status(200).send(apiResponse);

    } catch (err) {
        // Send error response in case of any exception
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName userDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userDetails = async (req, res) => {
    try {
        let record = await User.findOne({ _id: mongoose.Types.ObjectId(req.body.user_id) }).lean();
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
 * user update basically update user details 
 * POST
  @param {*} req // need user information with user id
  @param {*} res // show response sucess or failure with updated data
 */
let userUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedUser = {};

        for (const property in reqbody) {
            updatedUser[property] = reqbody[property];
        }
        await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.user_id) }, updatedUser, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedUser);
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
 * user orderlist show all order of particular user 
 * POST
  @param {*} req // need user user id
  @param {*} res // show order list 
 */

let adminUserOrderList = async (req, res) => {
    try {
        const page = parseInt(req.body.page) || 1;   // Default to page 1 if not provided
        const limit = parseInt(req.body.limit) || 10; // Default to 10 records per page if not provided
        const skip = (page - 1) * limit;

        let orderdetails_record = await order.aggregate([
            { $match: { $and: [{ "user_id": mongoose.Types.ObjectId(req.body.user_id) }] } },
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
                    "order_details.vendor_id": 1,
                    "order_details.product_id": 1,
                    "order_details.product_name": 1,
                    "order_details.product_image": 1,
                    "order_details.product_slug": 1,
                    "order_details.qty": 1,
                    "order_details.price": 1,
                    "order_details.addons": 1,
                    "order_details.addonsprice": 1,
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

        // Apply pagination to the filtered orders
        let totalOrders = orderdetails_record.length;
        let paginatedOrders = orderdetails_record.slice(skip, skip + limit);

        // Send the response with pagination info
        let apiResponse = response.generate(0, `Order List Showing`, {
            totalOrders: totalOrders, // Total number of filtered orders
            orders: paginatedOrders // Paginated result
        });
        res.status(200);
        res.send(apiResponse);


    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
 * user orderlist show all order of particular user 
 * POST
  @param {*} req // need user oder id
  @param {*} res // show updated status with order details
 */
let adminUserOrderDetails = async (req, res) => {
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

        let apiResponse = response.generate(0, `Order Details Showing`, orderdetails_record);
        res.status(200);
        res.send(apiResponse);


    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let getCouponUsageUsers = async (req, res) => {
    try {
        const { couponId } = req.body;
        // console.log(couponId)
        const usages = await CouponUsageModel.aggregate([
            {
                $match: {
                    couponId: mongoose.Types.ObjectId(couponId)
                }
            },
            {
                $group: {
                    _id: "$userId",
                    usageCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$user._id",
                    name: "$user.name",
                    email: "$user.email",
                    usageCount: 1,
                }
            }
        ]);




        let apiResponse = response.generate(0, ` Success`, {
            count: usages.length,
            users: usages.map(u => ({
                userId: u._id,
                name: u.name,
                email: u.email,
                usedAt: u.lastUsedAt,
            }))
        });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let getCouponByOrderId = async (req, res) => {
    try {
        const { orderId } = req.body;
        // 1️⃣ Find order
        const orderData = await order.findOne({ _id: orderId }).lean();

        if (!orderData) {
            return res.status(400).send(response.generate(1, 'Order not found', {}));
        }

        // 2️⃣ Find coupon using coupon_code
        const usage = await CouponUsageModel.findOne(
            { orderId: orderData._id },
        ).lean();

        if (!usage) {
            return res.status(200).send(response.generate(0, 'No coupon used for this order', {}));
        }

        // 2️⃣ Find coupon using coupon_id
        const coupon = await CouponModel.findOne(
            { _id: usage.couponId },
            { coupon_name: 1, _id: 0 }
        ).lean();

        let apiResponse = response.generate(0, ` Success`, coupon);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


module.exports = {
    userList: userList,
    userSearchList: userSearchList,
    userCreate: userCreate,
    uploadUserrdp: uploadUserrdp,
    userDetails: userDetails,
    userUpdate: userUpdate,
    adminUserOrderList: adminUserOrderList,
    adminUserOrderDetails: adminUserOrderDetails,
    getCouponUsageUsers: getCouponUsageUsers,
    getCouponByOrderId: getCouponByOrderId

}