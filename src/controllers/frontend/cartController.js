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
    const products = req.body.products; // Array of products to be added or updated

    try {
        let cart = await Cart.findOne({ "user_id": mongoose.Types.ObjectId(user_id) });

        if (cart) {
            let existingProductOwner;

            // Perform the check only if there are products in the cart
            if (cart.products.length > 0) {
                // Get the product_owner of the first product in the cart
                existingProductOwner = await Product.findOne({ _id: cart?.products[0]?.pro_id }).select('product_owner');
            }

            // Check for existing product owner only if there are products in the cart
            if (existingProductOwner) {
                for (const product of products) {
                    const { pro_id, left_eye_qty, right_eye_qty, qty, price, addons, addonsprice, pro_image, pro_name, pro_slug } = product;

                    // Fetch the product_owner of the current product
                    const currentProduct = await Product.findOne({ _id: pro_id }).select('product_owner');

                    // Check if the product_owner matches the existing one
                    if (!currentProduct || currentProduct.product_owner.toString() !== existingProductOwner?.product_owner.toString()) {
                        return res.status(400).json({ message: "All products must be from the same owner." });
                    }

                    let productIndex = cart.products.findIndex(p => p.pro_id.toString() === pro_id);

                    if (productIndex >= 0) {
                        // Update existing product
                        cart.products[productIndex].left_eye_qty = left_eye_qty;
                        cart.products[productIndex].right_eye_qty = right_eye_qty;
                        cart.products[productIndex].qty = qty;
                        cart.products[productIndex].price = price;
                        cart.products[productIndex].sub_total = ((price + addonsprice) * qty);
                        cart.products[productIndex].addons = addons;
                        cart.products[productIndex].addonsprice = addonsprice;
                    } else {
                        // Add new product to cart
                        cart.products.push({
                            pro_id,
                            left_eye_qty,
                            right_eye_qty,
                            qty,
                            price,
                            addons,
                            addonsprice,
                            pro_image,
                            pro_name,
                            pro_slug,
                            sub_total: ((price + addonsprice) * qty),
                        });
                    }
                }

                // Recalculate the total
                cart.total = cart.products.reduce((acc, prod) => acc + prod.sub_total, 0);

                // Save the updated cart
                cart = await cart.save();

            } else {
                // If cart has no products, just add the new products without checking the owner
                const newProducts = products.map(product => ({
                    ...product,
                    sub_total: (product.qty * product.price) + product.addonsprice,
                }));

                const total = newProducts.reduce((acc, prod) => acc + prod.sub_total, 0);

                cart.products.push(...newProducts);
                cart.total = total;

                cart = await cart.save();
            }

        } else {
            // New cart creation
            const firstProduct = await Product.findOne({ _id: products[0].pro_id }).select('product_owner');

            // Ensure all products belong to the same owner
            for (const product of products) {
                const currentProduct = await Product.findOne({ _id: product.pro_id }).select('product_owner');

                if (!currentProduct || currentProduct.product_owner.toString() !== firstProduct.product_owner.toString()) {
                    return res.status(400).json({ message: "All products must be from the same owner." });
                }
            }

            const newProducts = products.map(product => ({
                ...product,
                sub_total: (product.qty * product.price) + product.addonsprice,
            }));

            const total = newProducts.reduce((acc, prod) => acc + prod.sub_total, 0);

            cart = new Cart({
                user_id: mongoose.Types.ObjectId(user_id),
                products: newProducts,
                total: total,
            });

            cart = await cart.save();
        }

        let apiResponse = response.generate(0, `Success`, cart);
        res.status(200).send(apiResponse);
    } catch (err) {
        // Send Error Response
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