const response = require("../../libs/responseLib");
const otpLib = require("../../libs/otpLib");
const crypto = require("../../libs/passwordLib");
const Otp = require('../../models/otpModel');
const JWT = require('../../libs/tokenLib');
const mongoose = require('mongoose');
let check = require('../../libs/checkLib');
const order = require('../../models/orderModel');
const orderdetails = require('../../models/orderDetailsModel');
const payment = require('../../models/paymentDetailsModel');

const sendemail = require("../../libs/sendmail")

// Import Model
const User = require('../../models/userModel');
const UserAddress = require('../../models/userAddressModel');
const Product = require('../../models/productModel');
const Prodinventoryhistory = require('../../models/productInventoryHistoryModel')
const Userpasswordhistory = require('../../models/userPasswordHistoryModel')
const ShippingTaxModel = require('../../models/shippingTaxModel')
const VendorShippingTaxModel = require('../../models/vendorShippingTaxModel')
const StoreModel = require('../../models/storeModel')
//Email 
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { dirname } = require('path');

var handlebars = require('handlebars');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const orderModel = require("../../models/orderModel");
const cartModel = require("../../models/cartModel");
const checkLib = require("../../libs/checkLib");
const Mustache = require('mustache');
const { generatePDFStream } = require("../../libs/generatePDF");
const vendorModel = require("../../models/vendorModel");
const vendorProductAccess = require("../../models/vendorProductAccess");
const Commission = require("../../models/commisionModule");
const { console } = require("inspector");
const Admin = require('../../models/adminModel');
const CouponModel = require('../../models/couponModel')
const CouponUsageModel = require('../../models/couponUsageModel')

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
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
    host: 'email-smtp.us-east-2.amazonaws.com',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAILPASS
    }
}));

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName sendEmailForgotPassword
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let sendEmailForgotPassword = (options) => {
    return new Promise((resolve, reject) => {
        //console.log(dirname(require.main.filename));
        readHTMLFile(dirname(require.main.filename) + '/views/reg.html', function (err, html) {
            let template = handlebars.compile(html);
            let replacements = {
                password: options.password,
            };
            let htmlToSend = template(replacements);
            let mailOptions = {
                from: process.env.APP_EMAIL,
                to: options.email,
                subject: 'Welcome to Ralbatech :: Forgotpassword',
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName signup
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let signup = async (req, res) => {

    //console.log('Success to user controller');
    // let password = await crypto.hash(req.body.password).then((result)=>{
    //     return result;
    // });
    let password = await crypto.hash(req.body.password)

    let newUser = new User({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        password: password
    });

    try {

        let userdetailsData = await newUser.save((err, newUser) => {

            let passwordcheckObj = new Userpasswordhistory({
                user_id: newUser._id,
                previous_password: password,
            });
            passwordcheckObj.save();

            let userDetails = {
                name: req.body.name,
                email: req.body.email.toLowerCase(),
                phone: req.body.phone,
                password: req.body.password
            }



            //Send Welcome Template

            let option = {
                "template": `<h3>Hi ${req.body.name} !</h3><br/>
                <p>Welcome To Ralba Technologies 3D Shopping Store
                </p><br/>
                <p>Regards,<br/>
                Ralba Technologies Team</p>`,
                "receiver_mail": [`${req.body.email.toLowerCase()}`],
                "subject": `Ralba Technologies : Welcome mail`

            }
            sendemail.sendMailFunc(option);

            let apiResponse = response.generate(0, ` Success`, userDetails);
            res.status(200);
            res.send(apiResponse);
        })




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
    * @Modified_by 
    * @function async
    * @functionName generateOtp
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let generateOtp = async (req, res) => {

    let otpval = otpLib.generateOtpDigit(4)
    let newOtp = new Otp({
        phone: req.body.phone,
        otpValue: otpval,
        otpType: req.body.type
    })
    try {
        await newOtp.save((err, newOtp) => {

            //Send OTP Template

            let option = {
                "template": `<h3>Hi ${req.body.name} !</h3><br/>
                <p>Your sign-up OTP is: ${otpval}. Please enter this OTP to complete the sign-up process.</p><br/>
                <p>Best regards,<br/>
                
                Ralba Technologies Team</p>`,
                "receiver_mail": [`${req.body.email.toLowerCase()}`],
                "subject": `Ralba Technologies : Sign Up OTP Details`

            }
            sendemail.sendMailFunc(option);

            //console.log('success');
            let apiResponse = response.generate(0, ` Success`, 'OTP has been sent to your email');
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName login
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let login = async (req, res) => {
    try {

        //console.log(request_password);
        let verify_pass = await crypto.verify(req.body.password, req.body.record.password);
        if (verify_pass) {
            let resObj = {
                user_id: req.body.record._id,
                name: req.body.record.name,
                email: req.body.record.email.toLowerCase(),
                phone: req.body.record.phone,
            }
            let token = await JWT.generateToken(resObj);
            resObj.token = token;

            let record = await User.find({ status: 'active', email: req.body.email_phone.toLowerCase() });
            //console.log('User DETAILS', record);
            if (record) {
                let apiResponse = response.generate(0, ` Success`, resObj);
                res.status(200);
                res.send(apiResponse);
            } else {
                let apiResponse = response.generate(0, ` User Not Active`, {});
                res.status(200);
                res.send(apiResponse);
            }

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
    * @Modified_by 
    * @function async
    * @functionName createUserAddress
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createUserAddress = async (req, res) => {

    let defaultval = '0';
    try {
        let record = await UserAddress.findOne({ is_default: '1' });
        defaultval = check.isEmpty(record) ? '1' : '0';
        //console.log('address List', record)

        let newAddress = new UserAddress({
            user_id: req.user.user_id,
            user_full_name: req.body.user_full_name,
            addressline1: req.body.addressline1,
            addressline2: req.body.addressline2,
            city: req.body.city,
            postal_code: req.body.postal_code,
            mobile: req.body.mobile,
            state: req.body.state,
            is_default: defaultval
        });

        let result = await newAddress.save();
        let apiResponse = response.generate(0, ` Success`, result);
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
    * @functionName listUserAddress
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let listUserAddress = async (req, res) => {

    try {
        let record = await UserAddress.find({ status: 'active', user_id: mongoose.Types.ObjectId(req.user.user_id) });

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
    * @functionName UserAddressDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let UserAddressDetails = async (req, res) => {

    try {
        let record = await UserAddress.find({ _id: req.body.address_id, status: 'active', user_id: mongoose.Types.ObjectId(req.user.user_id) });

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
    * @functionName UpdateUserAddress
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let UpdateUserAddress = async (req, res) => {

    try {
        let reqbody = req.body;
        await UserAddress.updateMany({ "is_default": "1" }, { "$set": { "is_default": "0" } })
        //await UserAddress.findOneAndUpdate( {_id: mongoose.Types.ObjectId(req.body.address_id)}, allnotdefault, {new: true});
        let updateAddress = {};
        for (const property in reqbody) {
            updateAddress[property] = reqbody[property];
        }
        await UserAddress.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.address_id) }, updateAddress, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateAddress);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}
/**
    * @author Md Mustakim Sarkar
    * @Date_Created 13-07-2023
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName deleteUserAddress
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let deleteUserAddress = async (req, res) => {

    try {
        let is_used = await orderModel.find({ shipping_address_id: mongoose.Types.ObjectId(req.body.address_id) });
        if (is_used && is_used.length) {
            await UserAddress.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.body.address_id) });
            let apiResponse = response.generate(0, ` Success`, null);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, `Address is in use.`, null);
            res.status(412);
            res.send(apiResponse);
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
    * @Modified_by 
    * @function async
    * @functionName userDeatils
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userDeatils = async (req, res) => {

    try {
        let record = await User.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.user_id) });

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
    * @functionName userUpdate
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userUpdate = async (req, res) => {

    try {
        let reqbody = req.body;
        let updateUserData = {};
        for (const property in reqbody) {
            updateUserData[property] = reqbody[property];
        }
        //console.log(updateUserData);

        await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.user.user_id) }, updateUserData, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateUserData);
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
    * @Modified_by 
    * @function async
    * @functionName UserChangePassword
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let UserChangePassword = async (req, res) => {

    try {
        let record = await User.find({ status: 'active', _id: mongoose.Types.ObjectId(req.user.user_id) });

        let verify_pass = await crypto.verify(req.body.old_Password, record[0].password);
        if (verify_pass) {
            let password = await crypto.hash(req.body.new_Password)
            let newUser = {
                password: password
            };
            let userrecord = await User.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
            let updatePassword =
            {
                previous_password: password
            }
            await Userpasswordhistory.findOneAndUpdate({ user_id: mongoose.Types.ObjectId(req.user.user_id) }, updatePassword, { new: false });
            // let option = {
            //     "template": `<h3>Hi ${userrecord.name} !</h3><br/>
            //     <p>Your Password has been Changed. You can login now with new Password : ${req.body.new_Password}
            //     </p><br/>
            //     <p>Regards,<br/>
            //     Ralba Technologies Team</p>`,
            //     "receiver_mail": [`${userrecord.email}`],
            //     "subject": `Ralba Technologies : Login User Password Change`

            // }
            // sendemail.sendMailFunc(option);

            //console.log('Password change User', userrecord);

            let apiResponse = response.generate(0, ` Success`, newUser);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(1, ` Your old password does not match. Please check once.`, {});
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
    * @Modified_by 
    * @function async
    * @functionName checkSamePassword
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let checkSamePassword = async (req, res) => {

    try {
        let record = await Userpasswordhistory.find({ user_id: mongoose.Types.ObjectId(req.user.user_id) });
        if (record.length > 0) {
            let verify_pass = await crypto.verify(req.body.current_Password, record[0].previous_password);
            if (verify_pass) {

                let apiResponse = response.generate(1, ` Please use a different password. This password has already been used.`, '');
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
    * @Modified_by 
    * @function async
    * @functionName userForgotPassword
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userForgotPassword = async (req, res) => {

    try {
        let auto_gen_password = otpLib.generatePassword(8)
        let new_password = await crypto.hash(auto_gen_password);
        let record = await User.find({ status: 'active', email: req.body.email.toLowerCase() });
        let newUser = {
            password: new_password
        };
        if (record.length > 0) {
            let userrecord = await User.findOneAndUpdate({ _id: record[0]._id }, newUser, { new: true });
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
            let apiResponse = response.generate(1, ` Your email is not registered in our system`, {});
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
    * @Modified_by 
    * @function async
    * @functionName userGetShippingTax
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
const toObjectId = (value) => {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
        return null;
    }
    return mongoose.Types.ObjectId(value);
};

const resolveEffectiveVendorId = (cartLine, productDoc) => {
    const fulfillerId = toObjectId(cartLine?.fulfiller_vendor_id);
    if (fulfillerId) {
        return fulfillerId;
    }
    const ownerIdFromCart = toObjectId(cartLine?.product_owner_id);
    if (ownerIdFromCart) {
        return ownerIdFromCart;
    }
    const ownerIdFromProduct = toObjectId(productDoc?.product_owner);
    if (ownerIdFromProduct) {
        return ownerIdFromProduct;
    }
    return null;
};

const loadCartByRequest = async (req) => {
    const authUserId = toObjectId(req?.user?.user_id);
    if (!authUserId) {
        throw new Error('Invalid user token');
    }

    const requestedCartId = toObjectId(req.body.cart_id);
    const query = {
        user_id: authUserId
    };

    if (requestedCartId) {
        query._id = requestedCartId;
    }

    return cartModel.findOne(query).lean();
};

const resolveCartEffectiveVendorContext = async (cartProducts) => {
    const cartLines = Array.isArray(cartProducts?.products) ? cartProducts.products : [];
    const productIds = cartLines
        .map((line) => toObjectId(line?.pro_id))
        .filter((id) => !!id);

    const productDocs = await Product.find({ _id: { $in: productIds } })
        .select('_id product_owner product_slug')
        .lean();

    const productById = new Map(productDocs.map((doc) => [String(doc._id), doc]));
    const productBySlug = new Map(productDocs.map((doc) => [String(doc.product_slug), doc]));

    const effectiveVendorIds = [];
    for (const line of cartLines) {
        const lineProduct = productById.get(String(line?.pro_id)) || productBySlug.get(String(line?.pro_slug));
        const effectiveVendorId = resolveEffectiveVendorId(line, lineProduct);
        if (!effectiveVendorId) {
            throw new Error(`Unable to resolve effective vendor for cart item ${line?.pro_slug || line?.pro_id}`);
        }
        effectiveVendorIds.push(String(effectiveVendorId));
    }

    const uniqueVendorIds = Array.from(new Set(effectiveVendorIds));
    if (uniqueVendorIds.length > 1) {
        throw new Error('All products in cart must belong to the same effective vendor.');
    }

    return {
        effectiveVendorId: uniqueVendorIds.length ? mongoose.Types.ObjectId(uniqueVendorIds[0]) : null
    };
};

let userGetShippingTax = async (req, res) => {

    try {
        let shippingData = [];
        const cartProducts = await loadCartByRequest(req);

        let effectiveVendorId = null;
        if (cartProducts && Array.isArray(cartProducts.products) && cartProducts.products.length > 0) {
            const context = await resolveCartEffectiveVendorContext(cartProducts);
            effectiveVendorId = context.effectiveVendorId;
        }

        if (!effectiveVendorId) {
            effectiveVendorId = toObjectId(req.body.vendor_id);
        }

        if (effectiveVendorId) {
            shippingData = await VendorShippingTaxModel.find({ vendor_id: effectiveVendorId }).lean();
        }

        if (checkLib.isEmpty(shippingData)) {
            shippingData = await ShippingTaxModel.find({}).lean();
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
    * @Modified_by 
    * @function async
    * @functionName userOrderCreate
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let userOrderCreate = async (req, res) => {
    try {
        const storeDetails = await StoreModel.findOne({ store_slug: req.body.store_slug, status: 'active' }).lean();
        if (checkLib.isEmpty(storeDetails)) {
            throw new Error('Store is Empty');
        }

        const billingAddressId = toObjectId(req.body.billing_address_id);
        if (!billingAddressId) {
            return res.status(400).send(response.generate(1, 'Billing address is invalid', {}));
        }

        const [billingAddress, cartProducts] = await Promise.all([
            UserAddress.findOne({ _id: billingAddressId }).lean(),
            loadCartByRequest(req)
        ]);

        // Validate cart exists and has products
        if (!cartProducts || !cartProducts.products || cartProducts.products.length === 0) {
            return res.status(400).send(response.generate(1, 'Cart is empty or not found', {}));
        }

        // Validate billing address exists
        if (!billingAddress) {
            return res.status(400).send(response.generate(1, 'Billing address not found', {}));
        }

        const vendorContext = await resolveCartEffectiveVendorContext(cartProducts);
        const operationalVendorId = vendorContext.effectiveVendorId || toObjectId(req.body.vendor_id);

        let shippingData = [];
        if (operationalVendorId) {
            shippingData = await VendorShippingTaxModel.find({ vendor_id: operationalVendorId }).lean();
        }
        const shippingDataFallback = checkLib.isEmpty(shippingData) ? await ShippingTaxModel.find({}).lean() : shippingData;

        const shippingCharge = shippingDataFallback[0]?.shipping_charge || 0;
        const taxPercentage = shippingDataFallback[0]?.tax_percentage || 0;

        // check coupon code and calculate discount if applicable
        let couponRecord;
        let discountAmount = 0;
        if (req.body.coupon) {
            couponRecord = await CouponModel.findOne({ coupon_name: req.body.coupon, status: 'active' });
            if (couponRecord) {
                // Check if the coupon is valid for the current date
                const currentDate = new Date();
                if (currentDate >= couponRecord.start_date && currentDate <= couponRecord.end_date) {
                    // Calculate discount based on the type
                    if (couponRecord.type === 'percentage') {
                        discountAmount = (couponRecord.discount / 100) * parseFloat(req.body.total_order_amount);
                    } else if (couponRecord.type === 'fixed') {
                        discountAmount = couponRecord.discount;
                    }
                } else {
                    return res.status(400).send(response.generate(1, 'Coupon code is expired or not yet valid', {}));
                }
                if (req.body.total_order_amount < couponRecord.min_order_amount) {
                    return res.status(400).send(response.generate(1, `Minimum order amount required is ${couponRecord.min_order_amount}`, {}));
                }

            } else {
                return res.status(400).send(response.generate(1, 'Invalid coupon code', {}));
            }


            // Check if already used (not dynamic as of now as a user can one time use a coupon but can be changed in future based on requirement)
            const alreadyUsed = await CouponUsageModel.findOne({
                userId: mongoose.Types.ObjectId(req.user.user_id),
                couponId: couponRecord._id
            });
            if (alreadyUsed) {
                return res.status(400).send(response.generate(1, 'You have already used this coupon', {}));
            }
        }




        // Calculate amounts
        const taxAmount = parseFloat((Math.round(((req.body.total_order_amount - discountAmount) * taxPercentage / 100) * 100) / 100).toFixed(2));
        const totalOrderAmount = parseFloat((parseFloat(req.body.total_order_amount) + parseFloat(taxAmount) + parseFloat(shippingCharge) - discountAmount).toFixed(2));
        const discAmount = parseFloat((discountAmount).toFixed(2));
        console.log("ddddd", discAmount);
        // Create and save the order
        const orderResult = await new order({
            user_id: mongoose.Types.ObjectId(req.user.user_id),
            shipping_charge: shippingCharge,
            tax_amount: taxAmount,
            discount: discAmount,
            total_order_amount: totalOrderAmount,
            order_status: req.body.order_status,
            payment_status: 'pending',
            payment_method: req.body.payment_method,
            payment_id: null,
            transaction_id: '',
            shipping_address_id: mongoose.Types.ObjectId(req.body.shipping_address_id),
            billing_email: req.body.billing_email.toLowerCase(),
            billing_phone: req.body.billing_phone,
            billing_country: '',
            billing_first_name: billingAddress.user_full_name,
            billing_last_name: '',
            billing_address1: billingAddress.addressline1,
            billing_address2: billingAddress.addressline2,
            billing_city: billingAddress.city,
            billing_state: billingAddress.state,
            billing_zip: billingAddress.postal_code
        }).save();

        // Process products
        const vendorMetaCache = new Map();
        for (const od of cartProducts.products) {
            let prodRecord = toObjectId(od.pro_id)
                ? await Product.findById(mongoose.Types.ObjectId(od.pro_id)).lean()
                : null;

            if (!prodRecord && od.pro_slug) {
                prodRecord = await Product.findOne({ product_slug: od.pro_slug }).lean();
            }

            // Validate product exists
            if (!prodRecord) {
                throw new Error(`Product not found: ${od.pro_name || od.pro_slug}`);
            }

            // Check stock availability
            if (prodRecord.stock < od.qty) {
                throw new Error(`Product "${prodRecord.product_name}" is out of stock. Available: ${prodRecord.stock}, Requested: ${od.qty}`);
            }

            const updatedStock = prodRecord.stock - od.qty;

            await Promise.all([
                new Prodinventoryhistory({
                    product_id: mongoose.Types.ObjectId(od.pro_id),
                    inventory_status: 'product Order',
                    stock: od.qty,
                    update_stock: updatedStock
                }).save(),
                Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(od.pro_id) }, { stock: updatedStock }, { new: true })
            ]);

            const effectiveVendorId = resolveEffectiveVendorId(od, prodRecord);
            if (!effectiveVendorId) {
                throw new Error(`Unable to resolve effective vendor for product ${od.pro_slug || od.pro_id}`);
            }

            let vendorMeta = vendorMetaCache.get(String(effectiveVendorId));
            if (!vendorMeta) {
                vendorMeta = await vendorModel.findOne({ _id: effectiveVendorId }).select('vendor_type').lean();
                vendorMetaCache.set(String(effectiveVendorId), vendorMeta || { vendor_type: 'main' });
            }

            const commissionDetails = await calculateCommission(
                (parseFloat(od.price) + parseFloat(od.addonsprice || 0)),
                od.pro_id,
                od.qty,
                effectiveVendorId,
                vendorMeta?.vendor_type || 'main'
            );

            // Save order details along with commission details
            await new orderdetails({
                order_id: orderResult._id,
                store_id: prodRecord.product_store,
                vendor_id: effectiveVendorId,
                department_id: prodRecord.product_department,
                product_id: od.pro_id,
                product_name: od.pro_name,
                product_image: od.pro_image,
                product_slug: od.pro_slug,
                left_eye_qty: od.left_eye_qty,
                right_eye_qty: od.right_eye_qty,
                qty: od.qty,
                price: od.price,
                addons: od.addons,
                addonsprice: od.addonsprice || 0,
                commission_details: commissionDetails  // Include commission details here
            }).save();
        }

        if (req.body.coupon) {
            await CouponModel.updateOne(
                { _id: couponRecord._id },
                { $inc: { total_usage_count: 1 } }
            );

            await CouponUsageModel.create({
                userId: mongoose.Types.ObjectId(req.user.user_id),
                couponId: couponRecord._id,
                orderId: orderResult._id
            });
        }

        // Send API response
        res.status(200).send(response.generate(0, 'Order Successfully Placed', orderResult));

    } catch (err) {
        console.error('Order Create Error:', err);
        res.status(410).send(response.generate(1, `ERROR: ${err.message}`, {}));
    }
};

const calculateCommission = async (productPrice, productId, quantity, vendor_id, vendor_type) => {
    try {
        // Fetch the platform-wide commission settings
        const commissionData = await Commission.findOne();

        if (!commissionData) {
            throw new Error('Commission settings not found.');
        }

        let platformCharge = commissionData.platform_charge; // Platform-wide charge
        let vendorSpecificCharges = []; // Will store charge type, percentage, and calculated price
        let vendorProductAccessData
        if (vendor_type == 'access') {
            vendorProductAccessData = await vendorProductAccess.findOne({ product_id: productId, vendor_id: vendor_id });
        }
        else {
            vendorProductAccessData = await vendorProductAccess.findOne({ product_id: productId, main_vendor_id: vendor_id });
        }
        // Fetch vendor product access for the specific product


        // Calculate the total price based on the product price and quantity
        const totalProductPrice = productPrice * quantity;

        // Initialize vendorSpecificCharges with platform charge
        let platformChargePrice = (platformCharge / 100) * totalProductPrice;
        vendorSpecificCharges.push({
            type: 'Platform Charge',
            percentage: platformCharge,
            price: platformChargePrice
        });
        if (vendor_type == 'access') {
            let copyProductCharge = commissionData.vendor_charges.find(
                charge => charge.charge_type === 'Copy Product'
            );
            if (copyProductCharge) {
                let copyProductChargePrice = (copyProductCharge.charge_percentage / 100) * totalProductPrice;
                vendorSpecificCharges.push({
                    type: 'Copy Product',
                    percentage: copyProductCharge.charge_percentage,
                    price: copyProductChargePrice,
                    access_vendor_id: vendor_id
                });
            }
        }

        // If the product has a 3D asset, add the "3D Asset" charge
        if (vendorProductAccessData && vendorProductAccessData.field_name_edit.includes('product_3d_image')) {
            let asset3DCharge = commissionData.vendor_charges.find(
                charge => charge.charge_type === '3D Asset'
            );
            if (asset3DCharge) {
                let asset3DChargePrice = (asset3DCharge.charge_percentage / 100) * totalProductPrice;
                vendorSpecificCharges.push({
                    type: '3D Asset',
                    percentage: asset3DCharge.charge_percentage,
                    price: asset3DChargePrice,
                    access_vendor_id: vendorProductAccessData.vendor_id
                });
            }
        }

        // Calculate the total commission percentage
        let totalCommissionPercentage = vendorSpecificCharges.reduce((sum, charge) => sum + charge.percentage, 0);

        // Calculate the total commission price based on the total price
        let commissionPrice = (totalCommissionPercentage / 100) * totalProductPrice;

        // Calculate the net price after commission
        let netPrice = totalProductPrice - commissionPrice;

        return {
            commissionPrice,
            netPrice,
            appliedChargePercentage: totalCommissionPercentage,
            breakdownPercentage: vendorSpecificCharges // Contains the charge type, percentage, and calculated price
        };

    } catch (error) {
        console.error('Error calculating commission:', error);
        throw error;
    }
};






/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName userOrderPayment
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let userOrderPayment = async (req, res) => {
    try {
        let paymentStatus = 'pending';
        let orderStatus = 'initiated';
        let storeDetails = await StoreModel.findOne({ "store_slug": req.body.store_slug, "status": 'active' }).lean();
        if (checkLib.isEmpty(storeDetails)) {
            throw new Error('Store is Empty');
        }
        let subAdminDetails = await Admin.find({ name: { $ne: "Super Admin" } }).lean();

        const shippingAddressId = toObjectId(req.body.shipping_address_id);
        if (!shippingAddressId) {
            return res.status(400).send(response.generate(1, 'shipping_address_id is invalid', {}));
        }

        const [shippingAddress, cartProducts] = await Promise.all([
            UserAddress.findOne({ _id: shippingAddressId }).lean(),
            loadCartByRequest(req)
        ]);

        if (!shippingAddress) {
            return res.status(400).send(response.generate(1, 'Shipping address not found', {}));
        }
        if (!cartProducts || !Array.isArray(cartProducts.products) || cartProducts.products.length === 0) {
            return res.status(400).send(response.generate(1, 'Cart is empty or not found', {}));
        }

        const vendorContext = await resolveCartEffectiveVendorContext(cartProducts);
        const operationalVendorId = vendorContext.effectiveVendorId || toObjectId(req.body.vendor_id);
        const vendorDetails = operationalVendorId
            ? await vendorModel.findOne({ _id: operationalVendorId }).lean()
            : await vendorModel.findOne({ _id: storeDetails.store_owner }).lean();

        let shippingData = [];
        if (operationalVendorId) {
            shippingData = await VendorShippingTaxModel.find({ vendor_id: operationalVendorId }).lean();
        }

        // Fallback for shipping data
        const shippingDataFallback = checkLib.isEmpty(shippingData)
            ? await ShippingTaxModel.find({}).lean()
            : shippingData;

        const shippingCharge = shippingDataFallback[0]?.shipping_charge || 0;
        const taxPercentage = shippingDataFallback[0]?.tax_percentage || 0;



        // check coupon code and calculate discount if applicable
        let couponRecord;
        let discountAmount = 0;
        if (req.body.coupon) {
            couponRecord = await CouponModel.findOne({ coupon_name: req.body.coupon, status: 'active' });
            if (couponRecord) {
                // Check if the coupon is valid for the current date
                const currentDate = new Date();
                if (currentDate >= couponRecord.start_date && currentDate <= couponRecord.end_date) {
                    // Calculate discount based on the type
                    if (couponRecord.type === 'percentage') {
                        discountAmount = (couponRecord.discount / 100) * parseFloat(req.body.total_order_amount);
                    } else if (couponRecord.type === 'fixed') {
                        discountAmount = couponRecord.discount;
                    }
                } else {
                    return res.status(400).send(response.generate(1, 'Coupon code is expired or not yet valid', {}));
                }
                if (req.body.total_order_amount < couponRecord.min_order_amount) {
                    return res.status(400).send(response.generate(1, `Minimum order amount required is ${couponRecord.min_order_amount}`, {}));
                }

            } else {
                return res.status(400).send(response.generate(1, 'Invalid coupon code', {}));
            }
        }


        // Calculate amounts
        const taxAmount = parseFloat((Math.round(((req.body.total_order_amount - discountAmount) * taxPercentage / 100) * 100) / 100).toFixed(2));
        const totalOrderAmount = parseFloat((parseFloat(req.body.total_order_amount) + parseFloat(taxAmount) + parseFloat(shippingCharge) - discountAmount).toFixed(2));
        const discAmount = parseFloat((discountAmount).toFixed(2));
        // Create and save payment
        const paymentResult = await new payment({
            transaction_id: req.body.transaction_id,
            country_code: req.body.country_code,
            email_address: req.body.email_address.toLowerCase(),
            name: req.body.name,
            customer_id_paypal: req.body.customer_id_paypal,
            paypal_status: req.body.paypal_status,
            paypal_data: req.body.paypal_data
        }).save();
        if (req.body.payment_method === 'paypal') {
            paymentStatus = req.body.paypal_status;
        }
        if (req.body.payment_method === 'paypal' && req.body.paypal_status !== 'APPROVED' && req.body.paypal_status !== 'COMPLETED') {
            orderStatus = 'pending';
        }
        const orderObj = {
            transaction_id: req.body.transaction_id,
            payment_id: paymentResult._id,
            payment_status: paymentStatus,
            order_status: orderStatus
        }

        await order.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.order_id) }, orderObj);

        // Process products
        const emailProductList = [];
        for (const od of cartProducts.products) {
            const prodRecord = await Product.findOne({ product_slug: od.pro_slug }).lean();

            if (!prodRecord) {
                continue; // Skip if no product record is found
            }

            // Handling inventory updates if payment fails
            if (req.body.payment_method === 'paypal' && req.body.paypal_status !== 'APPROVED' && req.body.paypal_status !== 'COMPLETED') {
                const updatedStock = prodRecord.stock + od.qty;
                await Promise.all([
                    new Prodinventoryhistory({
                        product_id: mongoose.Types.ObjectId(od.pro_id),
                        inventory_status: 'product Order Failed',
                        stock: od.qty,
                        update_stock: updatedStock
                    }).save(),
                    Product.findOneAndUpdate({ _id: mongoose.Types.ObjectId(od.pro_id) }, { stock: updatedStock }, { new: true })
                ]);
            }
            console.log('prodRecord----------------', prodRecord);
            // Push product details with attributes to emailProductList
            emailProductList.push({
                product_image: od.pro_image,
                product_name: od.pro_name,
                totaladdons: od.addonsprice,
                left_eye_qty: od.left_eye_qty,
                right_eye_qty: od.right_eye_qty,
                hasEyeQty: od.left_eye_qty > 0 || od.right_eye_qty > 0,  // Set the condition for eye quantity
                attributes: prodRecord.attributes,
                qty: od.qty,
                product_price: od.price
            });
        }
        // Determine logo details
        const companyLogo = !storeDetails.is_logo; // companyLogo is false if is_logo is true
        const logoAvailable = !companyLogo && !checkLib.isEmpty(storeDetails.logo); // logoAvailable is true if companyLogo is false and logo is not empty
        const logoNotAvailable = !logoAvailable && !companyLogo; // logoNotAvailable is true if logoAvailable is false and companyLogo is false
        const siteLogo = logoAvailable ? storeDetails.logo : '';
        const siteLogoName = logoNotAvailable ? storeDetails.logo_name : '';
        // Prepare email template
        const template = fs.readFileSync(process.cwd() + "/config/invoice.html", "utf-8");
        console.log('req.body.transaction_id', req.body.transaction_id, typeof req.body.transaction_id)
        const emailOrderData = {
            company_logo: companyLogo,
            logo_available: logoAvailable,
            logo_not_available: logoNotAvailable,
            site_logo: siteLogo,
            site_logo_name: siteLogoName,
            user_name: shippingAddress.user_full_name,
            transaction_id: req.body.transaction_id,
            shipping_address: [{
                user_full_name: shippingAddress.user_full_name,
                addressline1: shippingAddress.addressline1,
                addressline2: shippingAddress.addressline2,
                city: shippingAddress.city,
                postal_code: shippingAddress.postal_code,
                state: shippingAddress.state,
                mobile: shippingAddress.mobile
            }],
            store_deatils: [{
                store_name: storeDetails.store_name,
                store_location: storeDetails.store_location
            }],
            order_products: emailProductList,
            subtotal: req.body.total_order_amount,
            tax_amount: taxAmount,
            shipping_charge: shippingCharge,
            discount: discAmount,
            total_order_amount: totalOrderAmount,
            hasTransactionId: req.body.transaction_id != 0 ? true : false,
            isPending: req.body.transaction_id == 0 ? true : false,
        };
        console.log('emailOrderData', emailOrderData);
        const renderedTemplate = Mustache.render(template, emailOrderData);

        // Generate PDF with error handling
        let pdfStream;
        try {
            pdfStream = await generatePDFStream(renderedTemplate, 'portrait');
            // fs.writeFileSync("output.html", renderedTemplate); // Removed to prevent permission errors
        } catch (pdfError) {
            console.error('PDF Generation Error:', pdfError);
            throw new Error('Failed to generate invoice PDF: ' + pdfError.message);
        }

        // Send email
        try {
            await sendemail.sendEmail(req.user.email, {
                body: renderedTemplate,
                cc: [process.env.ADMIN_EMAIL, vendorDetails?.email, ...subAdminDetails.map(admin => admin.email)].filter(Boolean),
                // cc: [process.env.ADMIN_EMAIL, vendorDetails.email],
                subject: req.body.transaction_id > 0 ? "Order confirmation" : "Order confirmation Pending",
                attachments: [{ content: pdfStream, contentType: "application/pdf", filename: "invoice.pdf" }]
            });
        } catch (emailError) {
            console.error('Email Send Error:', emailError);
            // Continue execution even if email fails
        }

        if (req.body.payment_method === 'paypal' && req.body.paypal_status !== 'APPROVED' && req.body.paypal_status !== 'COMPLETED') {
            // data for PayPal with status not approved
            let option = {
                "template": `<h3>Hi ${req.body.name}</h3><br/><p>We are unable to process your order because your payment was not successful. </p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [req.body.email_address],
                "subject": `Ralba Technologies : Your Payment Status was not approved`

            }
            sendemail.sendMailFunc(option);
        } else if (req.body.payment_method === 'paypal' && (req.body.paypal_status === 'APPROVED' || req.body.paypal_status === 'COMPLETED')) {


            // data for PayPal with status approved
            let option = {
                "template": `<h3>Hi ${req.body.name}</h3><br/><p>Your payment was successful, and we are now processing your order. The current payment status is: ${req.body.paypal_status}.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [req.body.email_address.toLowerCase()],
                "subject": `Ralba Technologies : Your Payment Status ${req.body.paypal_status}`

            }
            sendemail.sendMailFunc(option);
        } else if (req.body.payment_method === 'COD') {
            // data for other payment methods
            let option = {
                "template": `<h3>Hi ${req.body.name}</h3><br/><p>Your order has been placed successfully and will be processed for cash on delivery. Thank you for choosing this payment option.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [req.body.email_address.toLowerCase()],
                "subject": `Ralba Technologies : Payment Cash On Delivery`

            }
            sendemail.sendMailFunc(option);
        }
        // Send API response
        res.status(200).send(response.generate(0, 'Order Payment Successfully', {}));

    } catch (err) {
        console.error('Order Payment Error:', err);
        res.status(410).send(response.generate(1, `ERROR: ${err.message}`, {}));
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName userOrderList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userOrderList = async (req, res) => {
    try {
        // let orderdb_record = await order.findOne({user_id: mongoose.Types.ObjectId(req.user.user_id)} );

        //console.log('User Id', req.user.user_id);

        let orderdetails_record = await order.aggregate([
            { $match: { $and: [{ "user_id": mongoose.Types.ObjectId(req.user.user_id) }] } },
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
                    "tax_amount": 1,
                    "shipping_charge": 1,
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

        //console.log('Order Data', orderdetails_record);

        // return
        let apiResponse = response.generate(0, `Order Successfully Placed`, orderdetails_record);
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
    * @functionName userOrderDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let userOrderDetails = async (req, res) => {
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

        //console.log('Order Data', orderdetails_record);

        // return
        let apiResponse = response.generate(0, `Order Details Showing`, orderdetails_record);
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
    * @functionName contactmail
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let contactmail = async (req, res) => {


    try {

        let adminemail = 'info@ralbatech.com';


        let option = {
            "template": `<h3>Hi i am ${req.body.name} !</h3><br/>
                <p>I want to contact with you, my Contact details are
                </p><br/>
                <p>Name : ${req.body.name}<br/>
                <p>Email : ${req.body.email.toLowerCase()}<br/>
                <p>Phone : ${req.body.phone}<br/>
                <p>Massage : ${req.body.massage}<br/>`,
            "receiver_mail": [`${adminemail}`],
            "subject": `Ralba Technologies : Contact Us mail`

        }
        sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success Send Mail`, null);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Md Mustakim Sarkar
    * @Date_Created 27-06-2023
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



let sendAffiliateMail = async (req, res) => {
    try {

        let adminemail = 'info@ralbatech.com';


        let option = {
            "template": `<h3>Hi i am ${req.body.name} !</h3><br/>
                <p>I am interested to become an affiliate of Ralba Technologies, my contact details are
                </p><br/>
                <p>Name : ${req.body.name}<br/>
                <p>Email : ${req.body.email.toLowerCase()}<br/>
                <p>Description : ${req.body.description}<br/>`,
            "receiver_mail": [`${adminemail}`],
            "subject": `Ralba Technologies : Affiliates`

        }
        sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success Send Mail`, null);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}



let sendAffinityMail = async (req, res) => {
    try {

        let adminemail = 'info@ralbatech.com';

        let option = {
            "template": `<h3>Hi i am ${req.body.name} !</h3><br/>
                <p>I am interested in creating an affinity group for Ralba Technologies, my contact details are
                </p><br/>
                <p>Name : ${req.body.name}<br/>
                <p>Email : ${req.body.email.toLowerCase()}<br/>
                <p>Description : ${req.body.description}<br/>`,
            "receiver_mail": [`${adminemail}`],
            "subject": `Ralba Technologies : Affinity Group`

        }
        sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success Send Mail`, null);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let sendCreateBusinessAccountMail = async (req, res) => {
    try {

        let adminemail = 'info@ralbatech.com';

        let option = {
            "template": `<h3>Hi i am ${req.body.name} !</h3><br/>
                <p>I am interested in creating a business account for Ralba Technologies, my contact details are
                </p><br/>
                <p>Name : ${req.body.name}<br/>
                <p>Email : ${req.body.email.toLowerCase()}<br/>
                <p>Description : ${req.body.description}<br/>`,
            "receiver_mail": [`${adminemail}`],
            "subject": `Ralba Technologies : Create Business Account`

        }
        sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success Send Mail`, null);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        console.log("nnnnnnn")
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let couponsList = async (req, res) => {
    try {
        const couponlist = await CouponModel
            .find({ is_active: true, website_view: true }, { coupon_name: 1, description: 1, type: 1, discount: 1, min_order_amount: 1, per_user_limit: 1, start_date: 1, end_date: 1, _id: 0 })
            .sort({ createdAt: -1 })
            .lean();


        let apiResponse = response.generate(0, ` Success`, couponlist);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let couponSearchByName = async (req, res) => {

    let search = req.query.search || ''; // Extract search query from request params

    try {
        // Build search condition
        let searchCondition = {
            $and: [
                { is_active: true },
                { website_view: true },
                {
                    $or: [
                        { coupon_name: { $regex: search, $options: 'i' } }
                    ]
                }
            ]
        };

        // Find coupons based on the search condition
        const couponlist = await CouponModel.find(
            searchCondition,
            {
                coupon_name: 1,
                description: 1,
                type: 1,
                discount: 1,
                min_order_amount: 1,
                per_user_limit: 1,
                start_date: 1,
                end_date: 1,
                _id: 0
            }
        )
            .sort({ createdAt: -1 })
            .lean();

        // Send response with paginated users and total count
        let apiResponse = response.generate(0, `Success`, couponlist);
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

let couponSearchByNameAndCode = async (req, res) => {

    let coupon = req.body.coupon?.trim().toUpperCase();

    try {
        // Build search condition for name, email, and phone
        let searchCondition = {
            $or: [
                { coupon_name: coupon },
                { coupon_code: coupon }
            ]
        };

        // Find coupons based on the search condition, paginate and sort by creation date
        const particularCoupon = await CouponModel.findOne(searchCondition, { coupon_name: 1, description: 1, type: 1, discount: 1, min_order_amount: 1, per_user_limit: 1, start_date: 1, end_date: 1, _id: 0 })
            .lean();

        if (!particularCoupon) {
            let apiResponse = response.generate(0, `Coupon not found`, {});
            res.status(200).send(apiResponse);
        } else {
            // Send response with paginated users and total count
            let apiResponse = response.generate(0, `Success`, particularCoupon);
            res.status(200).send(apiResponse);
        }


    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


let checkCouponUsage = async (req, res) => {
    try {
        const { couponName } = req.body;
        console.log(couponName);
        const couponFromCouponName = await CouponModel
            .findOne({ is_active: true, coupon_name: couponName });

        if (!couponFromCouponName) {
            return res.status(400).send(response.generate(1, 'Coupon not found', {}));
        }

        const usageCount = await CouponUsageModel.countDocuments({
            userId: mongoose.Types.ObjectId(req.user.user_id),
            couponId: couponFromCouponName._id
        });

        let apiResponse = response.generate(0, ` Success`, usageCount);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let generateOtpPages = async (req, res) => {

    let otpval = otpLib.generateOtpDigit(4)
    let newOtp = new Otp({
        otpValue: otpval,
        otpType: req.body.type
    })
    try {
        await newOtp.save((err, newOtp) => {

            //Send OTP Template

            let option = {
                "template": `<h3>Hi ${req.body.name} !</h3><br/>
                <p>Your sign-up OTP is: ${otpval}. Please enter this OTP to complete the process.</p><br/>
                <p>Best regards,<br/>
                
                Ralba Technologies Team</p>`,
                "receiver_mail": [`${req.body.email.toLowerCase()}`],
                "subject": `Ralba Technologies : OTP Details`

            }
            sendemail.sendMailFunc(option);

            //console.log('success');
            let apiResponse = response.generate(0, ` Success`, 'OTP has been sent to your email');
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





module.exports = {
    signup: signup,
    generateOtp: generateOtp,
    login: login,
    createUserAddress: createUserAddress,
    listUserAddress: listUserAddress,
    UserAddressDetails: UserAddressDetails,
    UpdateUserAddress: UpdateUserAddress,
    deleteUserAddress: deleteUserAddress,
    userDeatils: userDeatils,
    userUpdate: userUpdate,
    UserChangePassword: UserChangePassword,
    checkSamePassword: checkSamePassword,
    userForgotPassword: userForgotPassword,
    userGetShippingTax: userGetShippingTax,
    userOrderCreate: userOrderCreate,
    userOrderPayment: userOrderPayment,
    userOrderList: userOrderList,
    userOrderDetails: userOrderDetails,
    contactmail: contactmail,
    uploadFiles: uploadFiles,
    sendAffiliateMail: sendAffiliateMail,
    sendAffinityMail: sendAffinityMail,
    couponsList: couponsList,
    couponSearchByName: couponSearchByName,
    checkCouponUsage: checkCouponUsage,
    couponSearchByNameAndCode: couponSearchByNameAndCode,
    sendCreateBusinessAccountMail: sendCreateBusinessAccountMail,
    generateOtpPages: generateOtpPages
}
