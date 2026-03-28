const responseLib = require('../../libs/responseLib');
const Joi = require('joi');
const Vendor = require('../../models/vendorModel');
const Admin = require('../../models/adminModel');
const Otp = require('../../models/otpModel');
const User = require('../../models/userModel');

vendorSignupValidationCheck = async (body) => {
    let recordcount = await Vendor.findOne({ $or: [{ phone: body.phone }, { email: body.email.toLowerCase() }] }).count();
    //console.log(recordcount);
    if (recordcount) {
        //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}

let getVendorDetails = async (body) => {

    let record = await Vendor.findOne({ email: body.email_phone.toLowerCase() });

    // console.log('Vendor Deatails', record);
    if (record) {

        let UserRecord = await Vendor.findOne({ email: body.email_phone.toLowerCase(), status: 'active' })

        if (UserRecord) {
            body.record = record;
            // console.log('Vendor Deatails 2', body.record);
            return body;
        }
        else {
            throw new Error('Vendor is not allowed to login');
        }
    }
    else {
        throw new Error('Email not found.');
    }
}

let getAdminDetails = async (body) => {
    let record = await Admin.findOne({
        email: body.email.toLowerCase()
    }).populate('role', '_id role_name').lean();
    if (record) {
        body.record = record;
        //console.log(body.record);
        return body;
    } else {
        //throw new Error('Email already exists');
        throw new Error('Email not found.');
    }
}

adminSignupValidationCheck = async (body) => {
    let recordcount = await Admin.findOne({ email: body.email.toLowerCase() }).count();
    if (recordcount > 0) {
        //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}

let storeProduct = Joi.object().keys({
    product_sku: Joi.string().allow(''),
    product_holder_ref: Joi.string().required(),
    product_rotation: Joi.array(),
    product_codination: Joi.array(),
});

let storeProductarr = Joi.array().items(storeProduct).required();

const vendorLoginValidateSchema = Joi.object({
    email_phone: Joi.string()
        .required(),
    password: Joi.string().required()
});
const vendorSignupValidateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    repeat_password: Joi.required().valid(Joi.ref('password')),
    phone: Joi.string().required(),
    otp: Joi.number().integer().required(),
    catagories: Joi.string().required(),
});

const adminLoginValidateSchema = Joi.object({
    email: Joi.string()
        .required(),
    password: Joi.string().required()
});
const adminCreateValidateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    role_id: Joi.string().required(),
});


const updateSettingValidateSchema = Joi.object({
    settings_id: Joi.string().required(),
    addto_cart_status: Joi.string().valid('active', 'inactive').required(),
    quentity_status: Joi.string().valid('active', 'inactive').required(),
});

const creareSettingValidateSchema = Joi.object({
    addto_cart_status: Joi.string().valid('active', 'inactive').required(),
    quentity_status: Joi.string().valid('active', 'inactive').required(),
});

const productCreateValidateSchema = Joi.object({
    product_sku: Joi.string().required(),
    product_name: Joi.string().required(),
    product_external_link: Joi.string().allow(''),
    product_description: Joi.string(),
    product_bg_color: Joi.string(),
    product_department: Joi.string().required(),
    product_category: Joi.string().required(),
    product_sub_category: Joi.string().allow(''),
    product_child_sub_category: Joi.string().allow(''),
    product_store: Joi.string().required(),
    product_image: Joi.array().items(
        Joi.object().keys({
            _id: Joi.string().required(),
            pro_image: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            image_name: Joi.string().required(),
        })
    ),
    product_3d_image: Joi.array().items(
        Joi.object().keys({
            _id: Joi.allow(''),
            pro_3d_image: Joi.allow(''),
            pro_3d_image_name: Joi.allow(''),
            status: Joi.allow(''),
        })
    ),
    product_varient: Joi.array().items(
        Joi.object().keys({
            varientId: Joi.string().required()
        })
    ),
    product_varient_options: Joi.array(),
    product_retail_price: Joi.number().required(),
    product_sale_price: Joi.allow(''),
    product_3dservice_status: Joi.string().valid('active', 'inactive').allow(''),
    product_stock: Joi.number().required(),
    width: Joi.allow(''),
    height: Joi.allow(''),
    product_availability: Joi.string().valid('YES', 'NO').required()
});
const storeValidateSchema = Joi.object({
    page: Joi.number()
        .required(),
    limit: Joi.number()
        .required()
});
const storeAddValidateSchema = Joi.object({
    is_copy: Joi.boolean().required(),
    
    main_vendor_id: Joi.string().allow('')
        .when('is_copy', { is: true, then: Joi.string().required(), otherwise: Joi.string().allow('') }),

    store_name: Joi.string().allow('')
        .when('is_copy', { is: false, then: Joi.string().required() }),  // Required if is_copy is false

    store_location: Joi.string().allow('')
        .when('is_copy', { is: false, then: Joi.string().required() }),  // Required if is_copy is false

    store_description: Joi.string().allow(''),
    domain_name: Joi.allow(''),
    store_jpg_file: Joi.string().allow(''),
    store_jpg_file_name: Joi.string().allow(''),
    store_glb_file: Joi.string().allow(''),
    store_glb_file_name: Joi.string().allow(''),
    store_json_file_name: Joi.string().allow(''),

    store_products: Joi.array().allow('').items(storeProductarr),

    is_logo: Joi.boolean().allow(null)
        .when('is_copy', { is: false, then: Joi.boolean().required() }),  // Required if is_copy is false

    logo_name: Joi.allow(''),
    logo: Joi.string().allow(''),
    logo_file_name: Joi.string().allow('')
});


const storeDetailsValidateSchema = Joi.object({
    store_id: Joi.string().required(),
});

const storeUpdateValidateSchema = Joi.object({
    store_id: Joi.string().required(),
    store_name: Joi.string().allow(''),
    store_location: Joi.string().allow(''),
    domain_name: Joi.allow(''),
    store_description: Joi.string().allow(''),
    store_jpg_file: Joi.string().allow(''),
    store_jpg_file_name: Joi.string().allow(''),
    store_glb_file: Joi.string().allow(''),
    store_glb_file_name: Joi.string().allow(''),
    store_json_file_name: Joi.string().allow(''),
    store_products: Joi.array().allow('').items(storeProductarr),
    is_logo: Joi.boolean().required(),
    logo_name: Joi.allow(''),
    logo: Joi.string().allow(''),
    logo_file_name: Joi.string().allow(''),
});
const storeUpdateAdminValidateSchema = Joi.object({
    store_id: Joi.string().required(),
    status: Joi.string().required(),

});

const storeDeleteValidateSchema = Joi.object({
    store_id: Joi.string().required()
})

const storeImageDeleteValidateSchema = Joi.object({
    image_name: Joi.string().required(),
})

const roomValidateSchema = Joi.object({
    room_name: Joi.string().required(),
    department_id: Joi.string().required(),
    roomelement_id: Joi.string().required(),
    roomsize: Joi.string().required(),
    roomcount: Joi.string().required(),
    texture: Joi.object({
        front_image_id: Joi.string().required(),
        right_image_id: Joi.string().required(),
        back_image_id: Joi.string().required(),
        left_image_id: Joi.string().required(),
        top_image_id: Joi.string().required(),
        floor_image_id: Joi.string().required(),
    })
});

const roomAvailableValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
    department_id: Joi.string().required(),
});

const roomDetailsValidateSchema = Joi.object({
    room_id: Joi.string().required()
});



const roomUpdateValidateSchema = Joi.object({
    room_id: Joi.string().required(),
    room_name: Joi.string().allow(''),
    department_id: Joi.string().allow(''),
    roomelement_id: Joi.string().allow(''),
    roomsize: Joi.string().allow(''),
    roomcount: Joi.string().allow(''),
    texture: Joi.object({
        front_image_id: Joi.string().allow(''),
        right_image_id: Joi.string().allow(''),
        back_image_id: Joi.string().allow(''),
        left_image_id: Joi.string().allow(''),
        top_image_id: Joi.string().allow(''),
        floor_image_id: Joi.string().allow(''),
    })
});

const roomDeleteValidateSchema = Joi.object({
    room_id: Joi.string().required(),
});


const productDeleteValidateSchema = Joi.object({
    product_id: Joi.string().required(),
});
const vendorProductIMageDeleteValidateSchema = Joi.object({
    product_id: Joi.string().required(),
    image_id: Joi.string().required(),
    image_name: Joi.string().required(),
    image_type: Joi.string().valid('prodimage', 'threed', 'tryon3d', 'tryon2d', 'store').required()
});

const vendorProductIMageDeleteServerValidateSchema = Joi.object({
    image_name: Joi.string().required(),
    image_type: Joi.string().valid('prodimage', 'threed', 'tryon3d', 'tryon2d', 'store').required()
});

const vendorProductSKUcheckValidateSchema = Joi.object({
    product_sku: Joi.string().required()
});

const departmentValidateSchema = Joi.object({
    department_name: Joi.string().required(),
    department_image: Joi.string().required(),
    department_image_name: Joi.string().required(),
    department_roomelement: Joi.string().required(),
    department_store: Joi.string().required(),

});

const departmentUpdateValidateSchema = Joi.object({
    department_id: Joi.string().required(),
    department_name: Joi.string().required(),
    department_image: Joi.string().required(),
    department_image_name: Joi.string().required(),
    department_roomelement: Joi.string().required(),
    department_store: Joi.string().required()
});

const departmentDeleteValidateSchema = Joi.object({
    department_id: Joi.string().required()
})

const departmentImageDeleteValidateSchema = Joi.object({
    department_image_name: Joi.string().required()
})

const vendorOrderUpdateValidateSchema = Joi.object({
    order_id: Joi.string().required(),
    order_status: Joi.string().required(),
    order_delivery_date: Joi.date().required()
})

const vendorOrderDetailsValidateSchema = Joi.object({
    order_id: Joi.string().required(),
})

const departmentDetailsValidateSchema = Joi.object({
    department_id: Joi.string().required()
})

const vendorDashboardValidateSchema = Joi.object({
    from_date: Joi.date().allow(''),
    to_date: Joi.date().allow(''),
})
const dashboardfilterValidateSchema = Joi.object({
    from_date: Joi.date().allow(''),
    to_date: Joi.date().allow(''),
    vendor_id: Joi.allow(''),
})

const generateOTPSchema = Joi.object({
    phone: Joi.string()
        .required(),
    name: Joi.string()
        .required(),
    email: Joi.string()
        .required(),
    type: Joi.string().
        valid("VendorSignUp", "ForgetPassword").required()
});

let vendorLoginValidate = async (req, res, next) => {
    try {
        const value = await vendorLoginValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            // Extract the actual message from the error details
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await getVendorDetails(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let removePreviousOTP = async (body) => {
    let otpDelete = await Otp.deleteOne({ $and: [{ phone: body.phone }, { otpType: body.type }] });
    //console.log(otpDelete);
    return body;
}

let otpValidate = async (body) => {
    let recordcount = await Otp.findOne({ $and: [{ phone: body.phone }, { otpValue: body.otp }, { otptype: body.otptype }] }).count();
    if (recordcount) {
        return body;
    } else {
        //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('OTP mismatch, try again later.');
    }
}

let checkPhoneExist = async (body) => {
    let recordcount = await Vendor.findOne({ phone: body.phone }).count();
    if (recordcount) {
        //console.log('checkPhoneExist', recordcount);
        throw new Error('Phone number already exists');
    }
    let recordcount2 = await User.findOne({ phone: body.phone }).count();
    if (recordcount2) {
        //console.log('checkEmailExist', recordcount);
        throw new Error('Phone number already use in user account');
    }
    return body;
}

let checkEmailExist = async (body) => {
    let recordcount = await Vendor.findOne({ email: body.email }).count();
    if (recordcount) {
        //console.log('checkEmailExist', recordcount);
        throw new Error('Email already exists');
    }
    let recordcount2 = await User.findOne({ email: body.email }).count();
    if (recordcount2) {
        //console.log('checkEmailExist', recordcount);
        throw new Error('Email already use in user account');
    }

    return body;
}

let generateOTPValidate = async (req, res, next) => {

    try {
        const value = await generateOTPSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            if (req.body.type == 'VendorSignUp') {
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

let vendorSignupValidate = async (req, res, next) => {
    try {
        const value = await vendorSignupValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await vendorSignupValidationCheck(req.body);
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

let adminLoginValidate = async (req, res, next) => {
    try {
        const value = await adminLoginValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await getAdminDetails(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let adminCreateValidate = async (req, res, next) => {
    try {
        const value = await adminCreateValidateSchema.validate(req.body);
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

let updateSettingValidate = async (req, res, next) => {
    try {
        const value = await updateSettingValidateSchema.validate(req.body);
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

let createSettingValidate = async (req, res, next) => {
    try {
        const value = await creareSettingValidateSchema.validate(req.body);
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



let vendorProductValidate = async (req, res, next) => {
    try {
        const value = await productCreateValidateSchema.validate(req.body);
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

let storeAddValidate = async (req, res, next) => {
    try {
        const value = await storeAddValidateSchema.validate(req.body);
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

let storeUpdateValidate = async (req, res, next) => {
    try {
        const value = await storeUpdateValidateSchema.validate(req.body);
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
let storeUpdateAdminValidate = async (req, res, next) => {
    try {
        const value = await storeUpdateAdminValidateSchema.validate(req.body);
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

let storeDeleteValidate = async (req, res, next) => {
    try {
        const value = await storeDeleteValidateSchema.validate(req.body);
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
let storeImageDeleteValidate = async (req, res, next) => {
    try {
        const value = await storeImageDeleteValidateSchema.validate(req.body);
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

let roomValidate = async (req, res, next) => {
    try {
        const value = await roomValidateSchema.validate(req.body);
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

let roomDetailsValidate = async (req, res, next) => {
    try {
        const value = await roomDetailsValidateSchema.validate(req.body);
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

let roomAvailableValidate = async (req, res, next) => {
    try {
        const value = await roomAvailableValidateSchema.validate(req.body);
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

let roomUpdateValidate = async (req, res, next) => {
    try {
        const value = await roomUpdateValidateSchema.validate(req.body);
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

let roomDeleteValidate = async (req, res, next) => {
    try {
        const value = await roomDeleteValidateSchema.validate(req.body);
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

let vendorProductDeleteValidate = async (req, res, next) => {
    try {
        const value = await productDeleteValidateSchema.validate(req.body);
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

let vendorProductIMageDeleteValidate = async (req, res, next) => {
    try {
        const value = await vendorProductIMageDeleteValidateSchema.validate(req.body);
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

let vendorProductIMageDeleteServerValidate = async (req, res, next) => {
    try {
        const value = await vendorProductIMageDeleteServerValidateSchema.validate(req.body);
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

let vendorProductSKUcheckValidate = async (req, res, next) => {
    try {
        const value = await vendorProductSKUcheckValidateSchema.validate(req.body);
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


let departmentValidate = async (req, res, next) => {
    try {
        const value = await departmentValidateSchema.validate(req.body);
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

            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let departmentUpdateValidate = async (req, res, next) => {
    try {
        const value = await departmentUpdateValidateSchema.validate(req.body);
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

let departmentDeleteValidate = async (req, res, next) => {
    try {
        const value = await departmentDeleteValidateSchema.validate(req.body);
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

let departmentImageDeleteValidate = async (req, res, next) => {
    try {
        const value = await departmentImageDeleteValidateSchema.validate(req.body);
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

let vendorOrderUpdateValidate = async (req, res, next) => {
    try {
        const value = await vendorOrderUpdateValidateSchema.validate(req.body);
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

let vendorOrderDetailsValidate = async (req, res, next) => {
    try {
        const value = await vendorOrderDetailsValidateSchema.validate(req.body);
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

let shippingTaxValidate = async (req, res, next) => {
    try {
        const value = await shippingTaxValidateSchema.validate(req.body);
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

const shippingTaxValidateSchema = Joi.object({
    shipping_charge: Joi.string().required(),
    tax_percentage: Joi.string().required(),
});

let commissionSetupValidate = async (req, res, next) => {
    try {
        const value = await commissionSetupValidateSchema.validate(req.body);
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

const commissionSetupValidateSchema = Joi.object({
    platform_charge: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .required()
        .messages({
            'number.base': 'Platform charge must be a number',
            'number.integer': 'Platform charge must be an integer',
            'number.min': 'Platform charge cannot be less than 0',
            'number.max': 'Platform charge cannot be more than 100',
            'any.required': 'Platform charge is required'
        }),
    vendor_charges: Joi.array()
        .items(Joi.object({
            charge_type: Joi.string()
                .valid('3D Asset', 'Copy Product', 'Other')
                .required()
                .messages({
                    'any.only': 'Invalid charge type',
                    'any.required': 'Charge type is required'
                }),
            charge_percentage: Joi.number()
                .integer()
                .min(0)
                .max(100)
                .required()
                .messages({
                    'number.base': 'Charge percentage must be a number',
                    'number.integer': 'Charge percentage must be an integer',
                    'number.min': 'Charge percentage cannot be less than 0',
                    'number.max': 'Charge percentage cannot be more than 100',
                    'any.required': 'Charge percentage is required'
                })
        }))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one vendor charge is required',
            'any.required': 'Vendor charges are required'
        })
});



let vendorDashboardValidate = async (req, res, next) => {
    try {
        const value = await vendorDashboardValidateSchema.validate(req.body);
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

let dashboardfilterValidate = async (req, res, next) => {
    try {
        const value = await dashboardfilterValidateSchema.validate(req.body);
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

let adminForgotPasswordValidate = async (req, res, next) => {
    try {
        const value = await adminForgotPasswordValidateSchema.validate(req.body);
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

const adminForgotPasswordValidateSchema = Joi.object({
    email: Joi.required(),
});


// Home Banner

let bannerCreateValidate = async (req, res, next) => {
    try {
        const value = await bannerCreateValidateSchema.validate(req.body);
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


let bannerDetailsValidate = async (req, res, next) => {
    try {
        const value = await bannerDetailsValidateSchema.validate(req.body);
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

let bannerUpdateValidate = async (req, res, next) => {
    try {
        const value = await bannerUpdateValidateSchema.validate(req.body);
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

let bannerDeleteValidate = async (req, res, next) => {
    try {
        const value = await bannerDeleteValidateSchema.validate(req.body);
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



// Home Banner Schema
const bannerCreateValidateSchema = Joi.object({
    banner_title: Joi.string().allow(...['', null]),
    banner_subtitle: Joi.string().allow(...['', null]),
    banner_title_color: Joi.string().allow(...['', null]),
    banner_subtitle_color: Joi.string().allow(...['', null]),
    banner_button_bg_color: Joi.string().allow(...['', null]),
    banner_button_text_color: Joi.string().allow(...['', null]),
    banner_background_image: Joi.string().required(),
    banner_background_image_name: Joi.string().required(),
    banner_sub_categories: Joi.array().allow(null),
    banner_top_brands: Joi.array().allow(null),
    banner_homepage_brands: Joi.array().allow(null),
});

const bannerDetailsValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
});

const bannerUpdateValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
    banner_title: Joi.string().allow(...['', null]),
    banner_subtitle: Joi.string().allow(...['', null]),
    banner_title_color: Joi.string().allow(...['', null]),
    banner_subtitle_color: Joi.string().allow(...['', null]),
    banner_button_bg_color: Joi.string().allow(...['', null]),
    banner_button_text_color: Joi.string().allow(...['', null]),
    banner_background_image: Joi.string().allow(''),
    banner_background_image_name: Joi.string().allow(''),
    banner_sub_categories: Joi.array().allow(null),
    banner_top_brands: Joi.array().allow(null),
    banner_homepage_brands: Joi.array().allow(null),
});

const bannerDeleteValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
});

let subadmindetailsValidate = async (req, res, next) => {
    try {
        const value = await subadmindetailsValidatechema.validate(req.body);
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

const subadmindetailsValidatechema = Joi.object({
    subadmin_id: Joi.string().required(),
});


let subadminupdateValidate = async (req, res, next) => {
    try {
        const value = await subadminupdateValidateschema.validate(req.body);
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

const subadminupdateValidateschema = Joi.object({
    subadmin_id: Joi.string()
        .required(),
    name: Joi.allow(''),
    email: Joi.string().allow(''),
    status: Joi.allow(''),
});


let assignModuleValidate = async (req, res, next) => {
    try {
        const value = await assignModuleValidateschema.validate(req.body);
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

const assignModuleValidateschema = Joi.object({
    subadmin_id: Joi.string().required(),
    module_id: Joi.string().required(),
});

let listsubadminmoduleValidate = async (req, res, next) => {
    try {
        const value = await listsubadminmoduleValidateschema.validate(req.body);
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

const listsubadminmoduleValidateschema = Joi.object({
    subadmin_id: Joi.string().required()
});

let vendorForgotPasswordValidate = async (req, res, next) => {
    try {
        const value = await vendorForgotPasswordValidateSchema.validate(req.body);
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

const vendorForgotPasswordValidateSchema = Joi.object({
    email: Joi.required(),
});

const checkSamePasswordValidateSchema = Joi.object({
    current_Password: Joi.required()
});


let vendorChangePasswordValidate = async (req, res, next) => {
    try {
        const value = await vendorChangePasswordValidateSchema.validate(req.body);
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

const vendorChangePasswordValidateSchema = Joi.object({
    old_Password: Joi.required(),
    new_Password: Joi.required(),
    confirm_Password: Joi.required(),
});


let adminChangePasswordValidate = async (req, res, next) => {
    try {
        const value = await adminChangePasswordValidateSchema.validate(req.body);
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

const adminChangePasswordValidateSchema = Joi.object({
    old_Password: Joi.required(),
    new_Password: Joi.required(),
    confirm_Password: Joi.required(),
});

const SubCategoriescreateValidateSchema = Joi.object({
    subcategory_name: Joi.string().required(),
    category_id: Joi.string().allow(''),
    subcategory_image: Joi.string().allow(''),
});

let SubCategoryCreateValidate = async (req, res, next) => {
    try {
        const value = await SubCategoriescreateValidateSchema.validate(req.body);
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
const ChildCategoriescreateValidateSchema = Joi.object({
    childsubcategory_name: Joi.string().required(),
    category_id: Joi.string().required(''),
    subcategory_id: Joi.string().required(''),
    childsubcategory_image: Joi.string().allow(''),
});

const storeDuplicateValidateSchema = Joi.object({
    store_slug: Joi.string().required(),
});


let ChildCategoryCreateValidate = async (req, res, next) => {
    try {
        const value = await ChildCategoriescreateValidateSchema.validate(req.body);
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

let storeDuplicateValidate = async (req, res, next) => {
    try {
        const value = await storeDuplicateValidateSchema.validate(req.body);
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

const storeProductUpdateValidateSchema = Joi.object({
    product_codination: Joi.array().required(),
    product_sku: Joi.string().allow(''),
    store_slug: Joi.string().required(),
    store_no: Joi.string().required(),
});

let storeProductUpdateValidate = async (req, res, next) => {
    try {
        const value = await storeProductUpdateValidateSchema.validate(req.body);
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


let addMediaTextContentValidate = async (req, res, next) => {
    try {
        const value = await addMediaTextContentValidateSchema.validate(req.body);
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


const addMediaTextContentValidateSchema = Joi.object({
    heading_text: Joi.string().required(),
    section_image: Joi.string().required(),
    section_image_name: Joi.string().required(),
    description_text: Joi.string().required(),
});



let mediaTextContentDetailsValidate = async (req, res, next) => {
    try {
        const value = await mediaTextContentDetailsValidateSchema.validate(req.body);
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


const mediaTextContentDetailsValidateSchema = Joi.object({
    media_text_contain_id: Joi.string().required()
});


let updateMediaTextContentValidate = async (req, res, next) => {
    try {
        const value = await updateMediaTextContentValidateSchema.validate(req.body);
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


const updateMediaTextContentValidateSchema = Joi.object({
    media_text_contain_id: Joi.string().required(),
    heading_text: Joi.string().allow(),
    section_image: Joi.string().allow(null),
    section_image_name: Joi.string().allow(null),
    description_text: Joi.string().allow(null),
    tag_List: Joi.array().allow(null),
    status: Joi.string().valid('active', 'inactive', 'pending', 'deleted').allow(null),
    web_view_status: Joi.string().valid('active', 'inactive').allow(null),
});


let productActivationValidate = async (req, res, next) => {
    try {
        const value = await productActivationValidateSchema.validate(req.body);
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


const productActivationValidateSchema = Joi.object({
    product_id: Joi.string().required()
});


let returnDurationValidate = async (req, res, next) => {
    try {
        const value = await returnDurationValidateSchema.validate(req.body);
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

const returnDurationValidateSchema = Joi.object({
    return_duration: Joi.string().required()
});


let couponAddValidate = async (req, res, next) => {
    try {
        const value = await couponAddValidateSchema.validate(req.body);
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


const couponAddValidateSchema = Joi.object({
    coupon_name: Joi.string().required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    discount: Joi.number().required(),
    min_order_amount: Joi.number().allow(null),
    per_user_limit: Joi.number().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    description: Joi.string().required(),
});


let couponDetailsValidate = async (req, res, next) => {
    try {
        const value = await couponDetailsValidateSchema.validate(req.body);
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

const couponDetailsValidateSchema = Joi.object({
    coupon_id: Joi.string().required()

});


let couponUpdateValidate = async (req, res, next) => {
    try {
        const value = await couponUpdateValidateSchema.validate(req.body);
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


const couponUpdateValidateSchema = Joi.object({
    coupon_name: Joi.string().required(),
    type: Joi.string().valid('percentage', 'fixed').required(),
    discount: Joi.number().required(),
    min_order_amount: Joi.number().allow(null),
    per_user_limit: Joi.number().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    description: Joi.string().required(),
});




let couponStatusChangeValidate = async (req, res, next) => {
    try {
        const value = await couponStatusChangeValidateSchema.validate(req.body);
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

const couponStatusChangeValidateSchema = Joi.object({
    coupon_id: Joi.string().required(),
    is_active: Joi.boolean().required(),
});

let couponWebsiteViewStatusChangeValidate = async (req, res, next) => {
    try {
        const value = await couponWebsiteViewStatusChangeValidateSchema.validate(req.body);
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

const couponWebsiteViewStatusChangeValidateSchema = Joi.object({
    coupon_id: Joi.string().required(),
    website_view: Joi.boolean().required(),
});



module.exports = {
    vendorLoginValidate: vendorLoginValidate,
    generateOTPValidate: generateOTPValidate,
    vendorSignupValidate: vendorSignupValidate,
    vendorForgotPasswordValidate: vendorForgotPasswordValidate,
    checkSamePasswordValidate: checkSamePasswordValidate,
    adminLoginValidate: adminLoginValidate,
    adminCreateValidate: adminCreateValidate,
    listsubadminmoduleValidate: listsubadminmoduleValidate,
    assignModuleValidate: assignModuleValidate,
    subadmindetailsValidate: subadmindetailsValidate,
    subadminupdateValidate: subadminupdateValidate,
    updateSettingValidate: updateSettingValidate,
    createSettingValidate: createSettingValidate,
    dashboardfilterValidate: dashboardfilterValidate,
    vendorDashboardValidate: vendorDashboardValidate,
    vendorChangePasswordValidate: vendorChangePasswordValidate,
    adminForgotPasswordValidate: adminForgotPasswordValidate,
    adminChangePasswordValidate: adminChangePasswordValidate,
    vendorProductValidate: vendorProductValidate,
    storeValidate: storeValidate,
    storeAddValidate: storeAddValidate,
    storeDetailsValidate: storeDetailsValidate,
    storeUpdateValidate: storeUpdateValidate,
    storeDeleteValidate: storeDeleteValidate,
    storeImageDeleteValidate: storeImageDeleteValidate,
    roomValidate: roomValidate,
    roomDetailsValidate: roomDetailsValidate,
    roomAvailableValidate: roomAvailableValidate,
    roomUpdateValidate: roomUpdateValidate,
    roomDeleteValidate: roomDeleteValidate,
    vendorProductDeleteValidate: vendorProductDeleteValidate,
    vendorProductIMageDeleteValidate: vendorProductIMageDeleteValidate,
    vendorProductIMageDeleteServerValidate: vendorProductIMageDeleteServerValidate,
    vendorProductSKUcheckValidate: vendorProductSKUcheckValidate,
    departmentValidate: departmentValidate,
    departmentUpdateValidate: departmentUpdateValidate,
    departmentDetailsValidate: departmentDetailsValidate,
    departmentDeleteValidate: departmentDeleteValidate,
    departmentImageDeleteValidate: departmentImageDeleteValidate,
    vendorOrderUpdateValidate: vendorOrderUpdateValidate,
    vendorOrderDetailsValidate: vendorOrderDetailsValidate,
    shippingTaxValidate: shippingTaxValidate,
    commissionSetupValidate: commissionSetupValidate,
    bannerCreateValidate: bannerCreateValidate,
    bannerDetailsValidate: bannerDetailsValidate,
    bannerUpdateValidate: bannerUpdateValidate,
    bannerDeleteValidate: bannerDeleteValidate,
    SubCategoryCreateValidate: SubCategoryCreateValidate,
    ChildCategoryCreateValidate: ChildCategoryCreateValidate,
    storeDuplicateValidate: storeDuplicateValidate,
    storeProductUpdateValidate: storeProductUpdateValidate,
    storeUpdateAdminValidate: storeUpdateAdminValidate,
    addMediaTextContentValidate: addMediaTextContentValidate,
    mediaTextContentDetailsValidate: mediaTextContentDetailsValidate,
    updateMediaTextContentValidate: updateMediaTextContentValidate,
    productActivationValidate: productActivationValidate,
    returnDurationValidate: returnDurationValidate,
    couponAddValidate: couponAddValidate,
    couponStatusChangeValidate: couponStatusChangeValidate,
    couponUpdateValidate: couponUpdateValidate,
    couponDetailsValidate: couponDetailsValidate,
    couponWebsiteViewStatusChangeValidate: couponWebsiteViewStatusChangeValidate
}