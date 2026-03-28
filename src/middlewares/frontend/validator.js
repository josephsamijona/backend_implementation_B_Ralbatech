const responseLib = require('../../libs/responseLib');

const Joi = require('joi');
const User = require('../../models/userModel');
const Cart = require('../../models/cartModel');
const Otp = require('../../models/otpModel');
const Vendor = require('../../models/vendorModel');

let signupValidationCheck = async (body) => {
    let recordcount = await User.findOne({ $or: [{ phone: body.phone }, { email: body.email.toLowerCase() }] }).count();
    //console.log(recordcount);
    if (recordcount) {
        //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}
let removePreviousOTP = async (body) => {
    let otpDelete = await Otp.deleteOne({ $and: [{ phone: body.phone }, { otpType: body.type }] });
    //console.log(otpDelete);
    return body;
}
let checkPhoneExist = async (body) => {
    let recordcount = await User.findOne({ phone: body.phone }).count();
    //console.log('checkPhoneExist', recordcount)
    if (recordcount) {
        //console.log('checkPhoneExist', recordcount);
        //throw new Error('Email already exists');
        throw new Error('Phone number already exists');
    }
 let recordcount2 = await Vendor.findOne({ phone: body.phone }).count();
        if (recordcount2) {
            //console.log('checkEmailExist', recordcount);
            throw new Error('Phone number already use in vendor account');
        }

    return body;
}

let checkEmailExist = async (body) => {
    try {
        let recordcount = await User.findOne({ email: body.email.toLowerCase() }).count();
        //console.log('checkEmailExist', recordcount);
        if (recordcount) {
            //console.log('checkEmailExist', recordcount);
            throw new Error('Email already exists');
        }
        let recordcount2 = await Vendor.findOne({ email: body.email }).count();
        if (recordcount2) {
            //console.log('checkEmailExist', recordcount);
            throw new Error('Email already use in vendor account');
        }
        return body;
    } catch (e) {
        throw new Error(e.message);
    }
}

let otpValidate = async (body) => {
    let recordcount = await Otp.findOne({ $and: [{ phone: body.phone }, { otpValue: body.otp }, { otptype: body.otptype }] }).count();
    if (recordcount) {
        return body;
    } else {
        //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('OTP missmatch, try again later.');
    }
}
let getUserDetails = async (body) => {
    let record = await User.findOne({
        $or: [{ phone: body.email_phone }, { email: body.email_phone.toLowerCase() }]
    });

    //console.log('User record',record);
    if (record) {

        let UserRecord = await User.findOne({ $or: [{ phone: body.email_phone }, { email: body.email_phone.toLowerCase() }], status: 'active' })
        //console.log('User record 2',UserRecord);

        if (UserRecord) {
            body.record = record._doc;
            return body;
        }
        else {
            throw new Error('User is not allowed to login');
        }


    } else {
        //throw new Error('Email already exists');
        throw new Error('Email or Phone not found.');
    }
}
let checkCartExists = async (body) => {
    const cartresult = await Cart.findOne({ '_id': body.cart_id, 'products.pro_id': body.pro_id });
    //console.log('cart delete Check', cartresult);
    if (!cartresult) {
        throw new Error('Cart not exists');
    }
    return body;
}


const signupValidateSchema = Joi.object({
    name: Joi.string()
        .required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    repeat_password: Joi.required().valid(Joi.ref('password')),
    phone: Joi.string()
        .required(),
    otp: Joi.number().integer().required()
});

const generateOTPSchema = Joi.object({
    phone: Joi.string()
        .required(),
    name: Joi.string()
        .required(),
    email: Joi.string()
        .required(),
    type: Joi.string().
        valid("SignUp", "ForgetPassword").required()
});

const loginValidateSchema = Joi.object({
    email_phone: Joi.string()
        .required(),
    password: Joi.string()
        .min(6)
        .max(20).required()
});

const storeValidateSchema = Joi.object({
    page: Joi.number()
        .required(),
    limit: Joi.number()
        .required()
});

const cartValidateSchema = Joi.object({
    pro_id: Joi.required(),
    pro_name: Joi.required(),
    pro_image: Joi.required(),
    pro_slug: Joi.required(),
    left_eye_qty: Joi.allow(''),
    right_eye_qty: Joi.allow(''),
    qty: Joi.number().required(),
    price: Joi.number().required(),
    options: Joi.array().required(),
    width: Joi.allow(''),
    height: Joi.allow('')
});

let productsobj = Joi.object().keys({
    pro_id: Joi.required(),
    pro_name: Joi.required(),
    pro_image: Joi.required(),
    pro_slug: Joi.required(),
    left_eye_qty: Joi.allow(''),
    right_eye_qty: Joi.allow(''),
    qty: Joi.number().required(),
    price: Joi.number().required(),
    addons: Joi.allow(''),
    addonsprice: Joi.allow('')

});

const bulkcartValidateSchema = Joi.object({
    products: Joi.array().items(productsobj).required(),
});


const uAddressValidateSchema = Joi.object({
    user_full_name: Joi.string().required(),
    addressline1: Joi.string().required(),
    addressline2: Joi.required(),
    city: Joi.string().required(),
    postal_code: Joi.number().required(),
    mobile: Joi.string().required(),
    state: Joi.string().required()
});

const uUpdateAddressValidateSchema = Joi.object({
    address_id: Joi.string().required(),
    user_full_name: Joi.string().required(),
    addressline1: Joi.string().required(),
    addressline2: Joi.allow(''),
    city: Joi.string().required(),
    postal_code: Joi.number().required(),
    mobile: Joi.string().allow(''),
    state: Joi.string().required(),
    is_default: Joi.string().allow(''),
});
const uDeleteAddressValidateSchema = Joi.object({
    address_id: Joi.string().required()
});

const userUpadteValidateSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.allow(''),
});

const userChangePasswordValidateSchema = Joi.object({
    old_Password: Joi.required(),
    new_Password: Joi.required(),
    confirm_Password: Joi.required(),
});

const userForgotPasswordValidateSchema = Joi.object({
    email: Joi.required(),
});

const checkSamePasswordValidateSchema = Joi.object(
    {
        current_Password: Joi.required()
    }
)

const deleteCartValidateSchema = Joi.object({
    cart_id: Joi.string().required(),
    pro_id: Joi.string().required()
})

const storeConfigValidateSchema = Joi.object({
    department_id: Joi.required(),
    vendor_id: Joi.required()
});

const uAddressDetailsValidateSchema = Joi.object({
    address_id: Joi.required(),
});


let signupValidate = async (req, res, next) => {

    try {
        const value = await signupValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            req.body.otptype = "SignUp";
            await signupValidationCheck(req.body);
            await otpValidate(req.body);
            await removePreviousOTP(req.body);
            next();
        }

    } catch (err) {
        //console.log(err);
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let generateOTPValidate = async (req, res, next) => {

    try {
        const value = await generateOTPSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {

            if (req.body.type == 'SignUp') {
                await checkEmailExist(req.body);
                await checkPhoneExist(req.body);
            }
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


let loginValidate = async (req, res, next) => {
    try {
        const value = await loginValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await getUserDetails(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let storeValidate = async (req, res, next) => {
    try {
        const value = await storeValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let cartValidate = async (req, res, next) => {
    try {
        const value = await cartValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let bulkcartValidate = async (req, res, next) => {
    try {
        const value = await bulkcartValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let deleteCartValidate = async (req, res, next) => {
    try {
        const value = await deleteCartValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await checkCartExists(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let storeConfigValidate = async (req, res, next) => {
    try {
        const value = await storeConfigValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let uAddressValidate = async (req, res, next) => {
    try {
        const value = await uAddressValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}



let uUpdateAddressValidate = async (req, res, next) => {
    try {
        const value = await uUpdateAddressValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}
let uDeleteAddressValidate = async (req, res, next) => {
    try {
        const value = await uDeleteAddressValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let uAddressDetailsValidate = async (req, res, next) => {
    try {
        const value = await uAddressDetailsValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let departmentDetailsValidate = async (req, res, next) => {
    try {
        const value = await departmentDetailsValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            //await adminSignupValidationCheck(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const departmentDetailsValidateSchema = Joi.object({
    department_slug: Joi.string().required()
})

let searchValidate = async (req, res, next) => {
    try {
        const value = await searchValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const filterStoreProductValidateSchema = Joi.object({
    // Backward compatibility: allow single tag_id as optional
    tag_id: Joi.string().allow(''),
    // New: support multiple tag IDs (allow empty strings so [""] is valid and can be ignored later)
    tag_ids: Joi.array().items(Joi.string().allow('')).optional(),
    product_category: Joi.string().allow(''),
    store_slug: Joi.string().required(),
    brand: Joi.string().allow(''),
    page: Joi.number().required(),
    limit: Joi.number().required(),
})

let filterStoreProductValidate = async (req, res, next) => {
    try {
        const value = await filterStoreProductValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const homefilterStoreProductValidateSchema = Joi.object({
    store_slug: Joi.string().required()
})

let homefilterStoreProductValidate = async (req, res, next) => {
    try {
        const value = await homefilterStoreProductValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let userUpadteValidate = async (req, res, next) => {
    try {
        const value = await userUpadteValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let userChangePasswordValidate = async (req, res, next) => {
    try {
        const value = await userChangePasswordValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let userForgotPasswordValidate = async (req, res, next) => {
    try {
        const value = await userForgotPasswordValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let checkSamePasswordValidate = async (req, res, next) => {
    try {
        const value = await checkSamePasswordValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const searchValidateSchema = Joi.object({
    searchkey: Joi.string().min(3).required(),
    store_slug: Joi.string().required()
})

let usergetShippingTaxValidate = async (req, res, next) => {
    try {
        const value = await usergetShippingTaxValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const usergetShippingTaxValidateSchema = Joi.object({
    vendor_id: Joi.string().required()
})



let userOrderCreateValidate = async (req, res, next) => {
    try {
        const value = await userOrderCreateValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const userOrderCreateValidateSchema = Joi.object({
    total_order_amount: Joi.number().required(),
    order_status: Joi.string().required(),
    country_code: Joi.required(),
    email_address: Joi.required(),
    payment_method: Joi.string().required(),
    name: Joi.required(),
    billing_address_id: Joi.required(),
    shipping_address_id: Joi.required(),
    billing_email: Joi.string().required(),
    billing_phone: Joi.string().required(),
    cart_id: Joi.allow(''),
    vendor_id: Joi.string().required(),
    store_slug: Joi.string().required(),
    coupon: Joi.string().allow('',null),
})

let userOrderPaymentValidate = async (req, res, next) => {
    try {
        const value = await userOrderPaymentValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const userOrderPaymentValidateSchema = Joi.object({
    order_id: Joi.string().required(),
    total_order_amount: Joi.number().required(),
    order_status: Joi.string().required(),
    payment_status: Joi.allow(''),
    payment_method: Joi.string().required(),
    transaction_id: Joi.allow(''),
    country_code: Joi.allow(''),
    email_address: Joi.allow(''),
    name: Joi.allow(''),
    customer_id_paypal: Joi.allow(''),
    paypal_status: Joi.allow(''),
    billing_address_id: Joi.required(),
    shipping_address_id: Joi.required(),
    billing_email: Joi.allow(''),
    billing_phone: Joi.allow(''),
    cart_id: Joi.allow(''),
    vendor_id: Joi.string().required(),
    paypal_data: Joi.allow(''),
    store_slug: Joi.string().required(),
    coupon: Joi.string().allow('',null),
})


let userOrderDetailsValidate = async (req, res, next) => {
    try {
        const value = await userOrderDetailsValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const userOrderDetailsValidateSchema = Joi.object({
    order_id: Joi.required(),

})

let contactValidate = async (req, res, next) => {
    try {
        const value = await contactValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const contactValidateSchema = Joi.object({
    name: Joi.required(),
    email: Joi.required(),
    phone: Joi.required().allow(''),
    massage: Joi.required(),

})

let storeViewValidate = async (req, res, next) => {
    try {
        const value = await storeViewValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let roomVendorValidate = async (req, res, next) => {
    try {
        const value = await roomVendorValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const roomVendorValidateSchema = Joi.object({
    vendor_id: Joi.required(),
})

const storeViewValidateSchema = Joi.object({
    store_id: Joi.required(),
    vendor_id: Joi.required(),
})

let vendorbannerValidate = async (req, res, next) => {
    try {
        const value = await vendorbannerValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const vendorbannerValidateSchema = Joi.object({
    store_slug: Joi.required(),
})


let storeDetailsValidate = async (req, res, next) => {
    try {
        const value = await storeDetailsValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const storeDetailsValidateSchema = Joi.object({
    store_slug: Joi.required(),
})

let vendorstoreDetailsValidate = async (req, res, next) => {
    try {
        const value = await vendorstoreDetailsValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const vendorstoreDetailsValidateSchema = Joi.object({
    store_slug: Joi.required(),
})


let storeConfigVendorValidate = async (req, res, next) => {
    try {
        const value = await storeConfigVendorValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const storeConfigVendorValidateSchema = Joi.object({
    vendor_id: Joi.required(),
})

let storeConfigVendorByUserValidate = async (req, res, next) => {
    try {
        const value = await storeConfigVendorByUserValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let returnSubmitValidate = async (req, res, next) => {
    try {
        const value = await returnSubmitValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const returnSubmitValidateSchema = Joi.object({
    order_id: Joi.string().required(),
    reason: Joi.string().required(),
    address: Joi.string().required(),
});

const storeConfigVendorByUserValidateSchema = Joi.object({
    store_slug: Joi.required(),
    product_category: Joi.allow(''),
    brand: Joi.allow(''),
    page: Joi.required(),
    limit: Joi.required(),
})




let otpValidatePage = async (body) => {
    let recordcount = await Otp.findOne({ $and: [{ otpValue: body.otp }, { otptype: body.otptype }] }).count();
    if (recordcount) {
        return body;
    } else {
        throw new Error('OTP missmatch, try again later.');
    }
}
let removePreviousOTPPage = async (body) => {
    let otpDelete = await Otp.deleteOne({ $and: [{ otpType: body.type }] });
    return body;
}

let sendAffiliateValidate = async (req, res, next) => {
    try {
        const value = await sendAffiliateValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            req.body.otptype = "Affiliate";
            await otpValidatePage(req.body);
            await removePreviousOTPPage(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}
const sendAffiliateValidateSchema = Joi.object({
    name: Joi.required(),
    email: Joi.required(),
    description: Joi.required(),
    otp: Joi.number().integer().required()
})




let sendAffinityValidate = async (req, res, next) => {
    try {
        const value = await sendAffinityValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            req.body.otptype = "Affinity";
            await otpValidatePage(req.body);
            await removePreviousOTPPage(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}
const sendAffinityValidateSchema = Joi.object({
    name: Joi.required(),
    email: Joi.required(),
    description: Joi.required(),
    otp: Joi.number().integer().required()
})


let sendCreateBusinessAccountValidate = async (req, res, next) => {
    try {
        const value = await sendCreateBusinessAccountValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            req.body.otptype = "Create Business Account";
            await otpValidatePage(req.body);
            await removePreviousOTPPage(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}
const sendCreateBusinessAccountValidateSchema = Joi.object({
    name: Joi.required(),
    email: Joi.required(),
    description: Joi.required(),
    otp: Joi.number().integer().required()
})



let generateOTPValidatePages = async (req, res, next) => {

    try {
        const value = await generateOTPSchemaPages.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const generateOTPSchemaPages = Joi.object({
    name: Joi.string()
        .required(),
    email: Joi.string()
        .required(),
    type: Joi.string().
        valid("Affiliate", "Affinity", "Create Business Account").required()
});

module.exports = {
    signupValidate: signupValidate,
    generateOTPValidate: generateOTPValidate,
    loginValidate: loginValidate,
    storeValidate: storeValidate,
    cartValidate: cartValidate,
    bulkcartValidate: bulkcartValidate,
    deleteCartValidate: deleteCartValidate,
    storeConfigValidate: storeConfigValidate,
    storeViewValidate: storeViewValidate,
    roomVendorValidate: roomVendorValidate,
    uAddressValidate: uAddressValidate,
    uAddressDetailsValidate: uAddressDetailsValidate,
    uUpdateAddressValidate: uUpdateAddressValidate,
    uDeleteAddressValidate: uDeleteAddressValidate,
    departmentDetailsValidate: departmentDetailsValidate,
    searchValidate: searchValidate,
    filterStoreProductValidate: filterStoreProductValidate,
    homefilterStoreProductValidate: homefilterStoreProductValidate,
    userUpadteValidate: userUpadteValidate,
    userChangePasswordValidate: userChangePasswordValidate,
    userForgotPasswordValidate: userForgotPasswordValidate,
    checkSamePasswordValidate: checkSamePasswordValidate,
    usergetShippingTaxValidate: usergetShippingTaxValidate,
    userOrderCreateValidate: userOrderCreateValidate,
    userOrderPaymentValidate: userOrderPaymentValidate,
    userOrderDetailsValidate: userOrderDetailsValidate,
    contactValidate: contactValidate,
    vendorbannerValidate: vendorbannerValidate,

    storeDetailsValidate: storeDetailsValidate,
    vendorstoreDetailsValidate: vendorstoreDetailsValidate,
    storeConfigVendorValidate: storeConfigVendorValidate,
    storeConfigVendorByUserValidate: storeConfigVendorByUserValidate,
    returnSubmitValidate: returnSubmitValidate,
    sendAffiliateValidate: sendAffiliateValidate,
    sendAffinityValidate: sendAffinityValidate,
    sendCreateBusinessAccountValidate: sendCreateBusinessAccountValidate,
    generateOTPValidatePages: generateOTPValidatePages
}