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
const Varient = require('../../models/varientModel');
const Department = require('../../models/departmentModel');
const Category = require('../../models/categoryModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const order = require('../../models/orderModel');
const orderdetails = require('../../models/orderDetailsModel');
const payment = require('../../models/paymentDetailsModel');
const vendorModel = require('../../models/vendorModel');
const checkLib = require("../../libs/checkLib");
const Store = require('../../models/storeModel');
const fileDelete = require('../../middlewares/fileDelete');

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName vendorOrderList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorOrderList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let order_ids = [];
        let vendorDetails = await vendorModel.findOne({ _id: mongoose.Types.ObjectId(req.user.vendor_id) });
        let vendor_id = vendorDetails.is_copy ? vendorDetails.main_vendor_id : vendorDetails._id;

        // console.log('vendorDetails---', vendorDetails);
        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(vendor_id) });
        let orderdetailsdb_record2 = await orderdetails.find({ "commission_details.breakdownPercentage.access_vendor_id": mongoose.Types.ObjectId(req.user.vendor_id) });

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


let vendorReturnOrderList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let order_ids = [];
        let vendorDetails = await vendorModel.findOne({ _id: mongoose.Types.ObjectId(req.user.vendor_id) });
        let vendor_id = vendorDetails.is_copy ? vendorDetails.main_vendor_id : vendorDetails._id;

        // console.log('vendorDetails---', vendorDetails);
        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(vendor_id) });
        let orderdetailsdb_record2 = await orderdetails.find({ "commission_details.breakdownPercentage.access_vendor_id": mongoose.Types.ObjectId(req.user.vendor_id) });

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

        // Fetch all matching order details (before pagination)
        let orderdetails_record = await order.aggregate([
            {
                $match: {
                    _id: { $in: ids },
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
};


let vendorOrderSearch = async (req, res) => {
    try {
        let searchString = req.query.search || '';

        if (searchString.length < 2) {
            throw new Error('Search string must be at least 2 characters long.');
        }

        let order_ids = [];

        console.log('req.user.vendor_id', req.user.vendor_id)
        // Fetch all order details for the vendor
        let orderdetailsdb_record = await orderdetails.find({ "vendor_id": mongoose.Types.ObjectId(req.user.vendor_id) });

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
let vendorOrderUpdate = async (req, res) => {
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
    * @functionName vendorOrderDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorOrderDetails = async (req, res) => {
    try {
        // Fetch order details with the necessary joins
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
        let filteredOrders = [];

        for (let i = 0; i < orderdetails_record.length; i++) {
            let otherproducts_total_price = 0;
            let vendorOrder = [];

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

                // Check if current user is an access vendor for the order item
                let accessVendorMatch = curr.commission_details?.some(cd =>
                    cd.breakdownPercentage.some(bp => String(bp.access_vendor_id) === String(req.user.vendor_id))
                );

                // If the user is the access vendor or the main vendor
                if (accessVendorMatch || String(curr.vendor_id) === String(req.user.vendor_id)) {
                    vendorOrder.push(curr); // Include the product in the vendor's order
                } else {
                    // Add price of other vendor's products (excluded from this vendor's order)
                    otherproducts_total_price += parseFloat(curr.price || 0) + parseFloat(curr.addonsprice || 0);
                }
            }

            // If vendor has any products in this order, adjust the total and push to filteredOrders
            if (vendorOrder.length > 0) {
                orderdetails_record[i].total_order_amount = parseFloat(orderdetails_record[i].total_order_amount || 0) - parseFloat(otherproducts_total_price || 0);
                orderdetails_record[i].order_details = vendorOrder; // Assign filtered order details
                filteredOrders.push(orderdetails_record[i]); // Add to filtered list
            }
        }


        let apiResponse = response.generate(0, `Order Details Showing`, filteredOrders);
        res.status(200);
        res.send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
};

let vendorOrderDetailsUpdatePrescription = async (req, res) => {
    try {
        let orderDetailId = req.params.id;
        const data = req.body;

        // const ordt = await orderdetails.findOne({ order_id: mongoose.Types.ObjectId(orderDetailId) });
        // if(ordt){
        //     console.log("Existing Prescription Data:", ordt);
        //     if(ordt.addons[0].extra_document[0]){
        //         console.log("Existing Prescription URL:", ordt.addons[0].extra_document[0]);
        //         let fileUrl = ordt.addons[0].extra_document[0].fileUrl;
        //         const fileName = fileUrl.split('/').pop();
        //         console.log(fileName);
        //         await fileDelete.prescriptionDelete(fileName);
        //     }
        // }

        const result = await orderdetails.findOneAndUpdate(
            { order_id: mongoose.Types.ObjectId(orderDetailId) },
            [
                {
                    $set: {
                        addons: {
                            $concatArrays: [
                                {
                                    $filter: {
                                        input: "$addons",
                                        as: "a",
                                        cond: {
                                            $not: [
                                                { $ifNull: ["$$a.extra_document", false] }
                                            ]
                                        }
                                    }
                                },
                                [{ extra_document: [data] }]
                            ]
                        }
                    }
                }
            ],
            { new: true }
        );


        let apiResponse = response.generate(0, `Prescription Updated Successfully`, result);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

module.exports = {
    vendorOrderList: vendorOrderList,
    vendorOrderSearch: vendorOrderSearch,
    vendorOrderUpdate: vendorOrderUpdate,
    vendorOrderDetails: vendorOrderDetails,
    vendorReturnOrderList: vendorReturnOrderList,
    vendorOrderDetailsUpdatePrescription: vendorOrderDetailsUpdatePrescription
}