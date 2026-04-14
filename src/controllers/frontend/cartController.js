/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note: all cart related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */



const response = require("../../libs/responseLib");

// Import Model
const Cart = require('../../models/cartModel');
const Orders = require('../../models/orderModel');
const mongoose = require('mongoose');
const { promiseImpl } = require("ejs");
const checkLib = require("../../libs/checkLib");
const Product = require('../../models/productModel');
const ReturnDurationModel = require('../../models/returnDurationModel')

/**
 * @author Ankush Shome
 * Fetch all cart data whitch particular user featch
 * GET
  @param {*} req // all cart data with auth token
  @param {*} res // show all cart data
 */
let listCart = async (req, res) => {

    try {
        let cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(req.user.user_id) }).lean();
        // //console.log(record);
        let apiResponse = response.generate(0, ` Success`, cart_data);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
 * @author Ankush Shome
 * add product information which need to add to cart
 * POST
  @param {*} req // need product information with quentity
  @param {*} res // show product list witch add to cart
 */
let addCart = async (req, res) => {

    let user_id = req.user.user_id;
    //console.log('=======**>', req.body)
    // Check Cart Exists for the User
    let cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean();
    //console.log('cart_data found =============>', cart_data);

    if (cart_data) {
        //console.log('cart_data found exist =============>', cart_data);
        // Check Product Exists on Cart
        let product_exists = await Cart.findOne({ "products.pro_id": mongoose.Types.ObjectId(req.body.pro_id) }).lean();
        if (product_exists) {

            // Update Products quantity and its price
            await Cart.updateOne({ 'products.pro_id': req.body.pro_id }, {
                '$set': {
                    'products.$.qty': req.body.qty,
                    'products.$.sub_total': parseFloat(req.body.qty * req.body.price)
                }
            });

            // Get Updated Products Details
            let updated_cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean();
            let total_value = updated_cart_data.products.reduce(function (total, array) {
                return total + array.sub_total;
            }, 0);

            // Update Cart Total Value
            await Cart.updateOne({ 'user_id': mongoose.Types.ObjectId(user_id) }, {
                '$set': {
                    'total': total_value
                }
            });

        } else {

            // Create New Product Object
            let newProduct = {
                pro_id: {
                    _id: req.body.pro_id
                },
                pro_name: req.body.pro_name,
                pro_image: req.body.pro_image,
                pro_slug: req.body.pro_slug,
                qty: parseInt(req.body.qty),
                price: parseFloat(req.body.price),
                options: req.body.options,
                width: req.body.width,
                height: req.body.height,
                sub_total: parseFloat(req.body.qty * req.body.price)
            };

            // Add New Product to Existing Cart
            await Cart.findOneAndUpdate({ "user_id": mongoose.Types.ObjectId(user_id) }, { $push: { products: newProduct } }, { new: true });

            // Get Updated Products Details
            let updated_cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean();
            let total_value = updated_cart_data.products.reduce(function (total, array) {
                return total + array.sub_total;
            }, 0);

            // Update Cart Total Value
            await Cart.updateOne({ 'user_id': mongoose.Types.ObjectId(user_id) }, {
                '$set': {
                    'total': total_value
                }
            });
        }

        // Send Response with Updated Cart
        let apiResponse = response.generate(0, ` Success`, await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean());
        res.status(200);
        res.send(apiResponse);

    } else {
        //console.log('cart_data found NOT exist =============>', cart_data);
        // Create New Cart Object
        let newCart = new Cart({
            user_id: {
                _id: req.user.user_id
            },
            products: [{
                pro_id: {
                    _id: req.body.pro_id
                },
                pro_name: req.body.pro_name,
                pro_image: req.body.pro_image,
                pro_slug: req.body.pro_slug,
                qty: parseInt(req.body.qty),
                price: parseFloat(req.body.price),
                options: req.body.options,
                width: req.body.width,
                height: req.body.height,
                sub_total: parseFloat(req.body.qty * req.body.price)
            }],
            total: parseFloat(req.body.qty * req.body.price)
        });

        // Create Cart for the first time for an User
        try {
            await newCart.save((err, newCart) => {

                // Send Response with Updated Cart
                let apiResponse = response.generate(0, ` Success`, newCart);
                res.status(200);
                res.send(apiResponse);
            });
        } catch (err) {

            // Send Error Response
            let apiResponse = responseLib.generate(0, ` ${err.message}`, {});
            res.status(410);
            res.send(apiResponse)
        }
    }
}

/**
 * add product information which need to add to cart Bulk
 * POST
  @param {*} req // need product information with quentity
  @param {*} res // show product list witch add to cart
 */
findProducts = (user_id) => {
    return new Promise(async (resolve, reject) => {
        cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean()
        resolve(cart_data)
    });
}
/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName addCartBulk
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let addCartBulk = async (req, res) => {
    const user_id = req.user.user_id;
    const products = Array.isArray(req.body.products) ? req.body.products : [];

    const toObjectId = (id) => {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
        return mongoose.Types.ObjectId(id);
    };

    const toNumber = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    try {
        if (products.length === 0) {
            return res.status(400).send(response.generate(1, 'products is required', {}));
        }

        const productIds = [];
        for (const p of products) {
            const id = toObjectId(p.pro_id);
            if (!id) {
                return res.status(400).send(response.generate(1, 'Invalid pro_id in products', {}));
            }
            productIds.push(id);
        }

        const productDocs = await Product.find({ _id: { $in: productIds } })
            .select('_id product_owner product_sale_price product_retail_price displayer_fulfiller')
            .lean();

        const productMap = new Map();
        for (const doc of productDocs) {
            productMap.set(String(doc._id), doc);
        }

        const normalizedLines = [];
        for (const raw of products) {
            const productId = String(raw.pro_id);
            const productDoc = productMap.get(productId);
            if (!productDoc) {
                return res.status(404).send(response.generate(1, `Product not found: ${productId}`, {}));
            }

            const qty = toNumber(raw.qty, 0);
            if (!Number.isFinite(qty) || qty <= 0) {
                return res.status(400).send(response.generate(1, 'qty must be a positive number', {}));
            }

            const ownerVendorId = String(productDoc.product_owner);
            const requestedFulfillerId = raw.fulfiller_vendor_id ? String(raw.fulfiller_vendor_id) : null;

            let effectiveVendorId = ownerVendorId;
            let effectivePrice = (productDoc.product_sale_price !== null && productDoc.product_sale_price !== undefined)
                ? Number(productDoc.product_sale_price)
                : Number(productDoc.product_retail_price);

            if (requestedFulfillerId && requestedFulfillerId !== ownerVendorId) {
                const dfEntry = (productDoc.displayer_fulfiller || []).find((df) =>
                    df.vendor_id &&
                    String(df.vendor_id) === requestedFulfillerId &&
                    df.fulfiller_status === 'active' &&
                    df.multi_vendor_support === true
                );

                if (!dfEntry || dfEntry.vendor_sales_price === null || dfEntry.vendor_sales_price === undefined) {
                    return res.status(400).send(response.generate(1, 'Invalid or inactive fulfiller for this product', {}));
                }

                effectiveVendorId = requestedFulfillerId;
                effectivePrice = Number(dfEntry.vendor_sales_price);
            }

            if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
                return res.status(400).send(response.generate(1, 'Unable to resolve product price for selected fulfiller', {}));
            }

            const addonsPrice = toNumber(raw.addonsprice, 0);
            const line = {
                pro_id: productDoc._id,
                pro_name: raw.pro_name,
                pro_image: raw.pro_image,
                pro_slug: raw.pro_slug,
                product_owner_id: productDoc.product_owner,
                fulfiller_vendor_id: effectiveVendorId === ownerVendorId ? null : toObjectId(effectiveVendorId),
                left_eye_qty: toNumber(raw.left_eye_qty, 0),
                right_eye_qty: toNumber(raw.right_eye_qty, 0),
                qty,
                price: effectivePrice,
                addons: raw.addons || [],
                addonsprice: addonsPrice,
                sub_total: (effectivePrice + addonsPrice) * qty
            };

            normalizedLines.push({
                effectiveVendorId,
                line
            });
        }

        let cart = await Cart.findOne({ user_id: mongoose.Types.ObjectId(user_id) });

        let cartVendorId = null;
        if (cart && cart.products.length > 0) {
            const firstCartItem = cart.products[0];
            if (firstCartItem.fulfiller_vendor_id) {
                cartVendorId = String(firstCartItem.fulfiller_vendor_id);
            } else if (firstCartItem.product_owner_id) {
                cartVendorId = String(firstCartItem.product_owner_id);
            } else if (firstCartItem.pro_id) {
                const firstProduct = await Product.findById(firstCartItem.pro_id).select('product_owner').lean();
                if (firstProduct?.product_owner) {
                    cartVendorId = String(firstProduct.product_owner);
                }
            }
        }

        for (const normalized of normalizedLines) {
            if (cartVendorId && normalized.effectiveVendorId !== cartVendorId) {
                return res.status(400).send(response.generate(1, 'All products must be from the same fulfiller vendor.', {}));
            }
        }

        if (!cart) {
            cart = new Cart({
                user_id: mongoose.Types.ObjectId(user_id),
                products: [],
                total: 0
            });
        }

        for (const normalized of normalizedLines) {
            const { line } = normalized;
            const productIndex = cart.products.findIndex((p) => String(p.pro_id) === String(line.pro_id));

            if (productIndex >= 0) {
                cart.products[productIndex].left_eye_qty = line.left_eye_qty;
                cart.products[productIndex].right_eye_qty = line.right_eye_qty;
                cart.products[productIndex].qty = line.qty;
                cart.products[productIndex].price = line.price;
                cart.products[productIndex].addons = line.addons;
                cart.products[productIndex].addonsprice = line.addonsprice;
                cart.products[productIndex].product_owner_id = line.product_owner_id;
                cart.products[productIndex].fulfiller_vendor_id = line.fulfiller_vendor_id;
                cart.products[productIndex].sub_total = line.sub_total;
            } else {
                cart.products.push(line);
            }
        }

        cart.total = cart.products.reduce((acc, prod) => acc + toNumber(prod.sub_total, 0), 0);
        cart = await cart.save();

        let apiResponse = response.generate(0, `Success`, cart);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName addCartFn
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let addCartFn = async (cart_data, elem, user_id) => {
    if (cart_data) {
        //console.log('True');
        // Check Product Exists on Cart
        let product_exists = await Cart.findOne({ "products.pro_id": mongoose.Types.ObjectId(elem.pro_id) }).lean();
        if (product_exists) {
            //console.log("product_existsproduct_existsproduct_existsproduct_exists", product_exists)
            // Update Products quantity and its price


            let pro_slugArr = []


            await Promise.resolve(pro_slugArr = product_exists.products.reduce(async (p, c) => {

                if (c.pro_slug == elem.pro_slug) {
                    //console.log("=================================>", c)
                    p[`${c.pro_slug}`] = {
                        qty: (c.qty + elem.qty),
                        price: (c.qty * elem.price)
                    }
                    //console.log(p)
                }
                return p

            }, {}))

            //console.log("pro_slugArrpro_slugArrpro_slugArrpro_slugArr", pro_slugArr)


            // Get Updated Products Details
            let updated_cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean();
            let total_value = updated_cart_data.products.reduce(function (total, array) {
                return total + array.sub_total;
            }, 0);

            // Update Cart Total Value
            await Cart.updateOne({ 'user_id': mongoose.Types.ObjectId(user_id) }, {
                '$set': {
                    'total': total_value
                }
            });

        } else {

            // Create New Product Object
            let newProduct = {
                pro_id: {
                    _id: elem.pro_id
                },
                pro_name: elem.pro_name,
                pro_image: elem.pro_image,
                pro_slug: elem.pro_slug,
                qty: parseInt(elem.qty),
                price: parseFloat(elem.price),
                options: elem.options,
                width: elem.width,
                height: elem.height,
                sub_total: parseFloat(elem.qty * elem.price)
            };

            // Add New Product to Existing Cart
            await Cart.findOneAndUpdate({ "user_id": mongoose.Types.ObjectId(user_id) }, { $push: { products: newProduct } }, { new: true });

            // Get Updated Products Details
            let updated_cart_data = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) }).lean();
            let total_value = updated_cart_data.products.reduce(function (total, array) {
                return total + array.sub_total;
            }, 0);

            // Update Cart Total Value
            await Cart.updateOne({ 'user_id': mongoose.Types.ObjectId(user_id) }, {
                '$set': {
                    'total': total_value
                }
            });

        }

    } else {
        //console.log('False');
        // Create New Cart Object
        let newCart = new Cart({
            user_id: {
                _id: user_id
            },
            products: [{
                pro_id: {
                    _id: elem.pro_id
                },
                pro_name: elem.pro_name,
                pro_image: elem.pro_image,
                pro_slug: elem.pro_slug,
                qty: parseInt(elem.qty),
                price: parseFloat(elem.price),
                options: elem.options,
                width: elem.width,
                height: elem.height,
                sub_total: parseFloat(elem.qty * elem.price)
            }],
            total: parseFloat(elem.qty * elem.price)
        });

        await newCart.save();

    }
}

/**
 * @author Ankush Shome
 * delete cart items which particular user provide
 * POST
  @param {*} req // need to send cart id and product id for delete data with user auth
  @param {*} res // show response sucess or failure
 */
let deleteCart = async (req, res) => {
    try {
        // Remove the product from the cart
        await Cart.findByIdAndUpdate(
            req.body.cart_id,
            { $pull: { "products": { pro_id: req.body.pro_id } } },
            { safe: true, upsert: true }
        );

        // Fetch the updated cart
        let updatedCart = await Cart.findOne({ "_id": mongoose.Types.ObjectId(req.body.cart_id) }).lean();

        if (updatedCart) {
            // Recalculate the total
            updatedCart.total = updatedCart.products.reduce((acc, prod) => acc + prod.sub_total, 0);

            // Save the updated total
            await Cart.findByIdAndUpdate(req.body.cart_id, { total: updatedCart.total });

            // Respond with the updated cart
            let apiResponse = response.generate(0, `Success`, updatedCart);
            res.status(200).send(apiResponse);
        } else {
            // Cart not found
            let apiResponse = response.generate(1, "Cart not found", {});
            res.status(404).send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(0, `ERROR: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }

}



// Check return eligibility
let checkReturnEligibility = async (req, res) => {
    try {
        const order = await Orders.findById(req.params.orderId);
        if (!order || order.order_status !== 'delivered') {
            return res.status(400).json({ eligible: false });
        }

        let returnDurationData = await ReturnDurationModel.findOne({});
        const returnWindow = returnDurationData?.return_duration || 7;
        const lastEligibleDate = new Date(order.createdAt.getTime() + returnWindow * 86400000);

        const eligible = new Date() <= lastEligibleDate;

        res.json({
            eligible,
            returnWindowDays: returnWindow
        });
    } catch (err) {
        let apiResponse = response.generate(0, `ERROR: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }

}

let returnSubmit = async (req, res) => {
    try {
        const order = await Orders.findById(req.body.order_id);
        if (!order) {
            let apiResponse = response.generate(1, "Order not found", {});
            res.status(404).send(apiResponse);
            return;
        }

        //return address fixed
        req.body.address = 'RDM Enterprise Group LLC, 32 NEWBURY ST, PROVIDENCE, RI 02904-1119, United States'

        // Update order status to 'return requested' and save return details
        await Orders.findByIdAndUpdate(req.body.order_id, { order_status: 'return requested', return_reason: req.body.reason, return_address: req.body.address, return_requested_at: new Date() });

        let apiResponse = response.generate(0, "Return request submitted successfully", {});
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `ERROR: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
}

module.exports = {
    listCart: listCart,
    addCart: addCart,
    addCartBulk: addCartBulk,
    deleteCart: deleteCart,
    checkReturnEligibility: checkReturnEligibility,
    returnSubmit: returnSubmit
}
