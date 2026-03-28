const responseLib = require('../../libs/responseLib');
const Joi = require('joi');
const Admin = require('../../models/adminModel');
const Vendor = require('../../models/vendorModel');
const User = require('../../models/userModel');

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

let getVendorAdminDetails = async (body) => {
    let record = await Admin.findOne({
        email: body.email.toLowerCase()
    }).lean();
    if (record) {
        body.record = record;
        //console.log(body.record);
        return body;
    } else {
        record = await Vendor.findOne({
            email: body.email.toLowerCase()
        }).lean();
        if (record) {
            body.record = record;
            //console.log(body.record);
            return body;
        }
        else {
            //throw new Error('Email already exists');
            throw new Error('Email not found.');
        }
    }
}

let adminSignupValidationCheck = async (body) => {
    let recordcount = await Vendor.findOne({ $or: [{ phone: body.phone }, { email: body.email.toLowerCase() }] }).count();
    //console.log('adminSignupValidationCheck',recordcount);
    if (recordcount) {
        // //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}


let vendorSignupValidationCheck = async (body) => {
    let recordcount = await Vendor.findOne({ $or: [{ phone: body.phone }, { email: body.email.toLowerCase() }] }).count();
    //console.log('vendorSignupValidationCheck',recordcount);
    if (recordcount) {
        // //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}

let userSignupValidationCheck = async (body) => {
    let recordcount = await User.findOne({ $or: [{ phone: body.phone }, { email: body.email.toLowerCase() }] }).count();
    //console.log('userSignupValidationCheck',recordcount);
    if (recordcount) {
        // //console.log(recordcount);
        //throw new Error('Email already exists');
        throw new Error('Email or Phone already exists');
    }
    return body;
}

let childcategoryDetails = Joi.object().keys({
    category_name: Joi.string().required(),
    child_categories: Joi.array().allow(''),
});

let subcategoryDetails = Joi.object().keys({
    category_name: Joi.string().required(),
    child_categories: Joi.array().items(childcategoryDetails).allow(''),
});

let attribute_values = Joi.object().keys({
    values: Joi.string().required(),
});

let attributesDetails = Joi.object().keys({
    attribute_name: Joi.string().required(),
    attribute_input: Joi.string().required(),
    attribute_slug: Joi.string().allow(''),
    is_mandatory: Joi.boolean().required(),
    attribute_value: Joi.array().items(attribute_values).allow(''),
});

let addons_value = Joi.object().keys({
    values: Joi.string().allow('', null),
    price: Joi.string().required(),
    value_image: Joi.string().allow('', null),
    value_id: Joi.string().allow(''),
    value_slug: Joi.string().allow(''),
    add_ons_parent_value: Joi.string().allow('', null)
});

let addOns = Joi.object().keys({
    add_ons_name: Joi.string().required(),
    addon_slug: Joi.string().allow(''),
    add_ons_input: Joi.string().required(),
    add_ons_help: Joi.string().allow(''),
    add_ons_code: Joi.string().allow(''),
    add_ons_level: Joi.string().allow(''),
    add_ons_step_no: Joi.string().required(),
    is_mandatory: Joi.boolean().required(),
    add_ons_parent_name: Joi.string().allow('', null),
    add_ons_value: Joi.array().items(addons_value).allow(''),
});


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
            await adminSignupValidationCheck(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

const adminLoginValidateSchema = Joi.object({
    email: Joi.string()
        .required(),
    password: Joi.string()
        .alphanum()
        .min(6)
        .max(20)
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});
const adminCreateValidateSchema = Joi.object({
    name: Joi.string()
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string()
        .alphanum()
        .min(6)
        .max(20)
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    repeat_password: Joi.required().valid(Joi.ref('password')),
    role_id: Joi.string()
        .required(),
});

// Store Validate Function

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

// Store Schema

const storeValidateSchema = Joi.object({
    page: Joi.number()
        .required(),
    limit: Joi.number()
        .required(),
    vendor_id: Joi.string().required()
});
const storeDetailsValidateSchema = Joi.object({
    store_id: Joi.string().required()

});
let storeProduct = Joi.object().keys({
    product_sku: Joi.string().allow(''),
    product_holder_ref: Joi.string().required(),
    product_rotation: Joi.array(),
    product_codination: Joi.array(),
});
let storeProductarr = Joi.array().items(storeProduct).required();
const storeUpdateValidateSchema = Joi.object({
    store_id: Joi.string().required(),
    store_owner_id: Joi.string().allow(''),
    store_name: Joi.string().allow(''),
    store_image: Joi.string().allow(''),
    store_location: Joi.string().allow(''),
    domain_name: Joi.string().allow(''),
    status: Joi.string().allow(''),
    store_description: Joi.string().allow(''),
    store_glb_file: Joi.string().allow(''),
    store_glb_file_name: Joi.string().allow(''),
    store_jpg_file: Joi.string().allow(''),
    store_jpg_file_name: Joi.string().allow(''),
    store_products: Joi.array().allow('').items(storeProductarr),
    store_json_file_name: Joi.string().allow(''),
    is_logo: Joi.boolean().allow(''),
    logo_name: Joi.allow(''),
    logo: Joi.string().allow(''),
    logo_file_name: Joi.string().allow(''),
});

const storeDeleteValidateSchema = Joi.object({
    store_id: Joi.string().required(),
    store_owner_id: Joi.string().required()
})

// Vendor Product Validate Function
let adminVendorProductValidate = async (req, res, next) => {
    try {
        const value = await adminVendorProductValidateSchema.validate(req.query);
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

// Vendor Product Validate Schema
const adminVendorProductValidateSchema = Joi.object({
    vendor_id: Joi.string().required()

});


// Department functions

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

let departmentUpdateValidate = async (req, res, next) => {
    try {
        const value = await departmentUpdateValidateSchema.validate(req.body);
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

let departmentDeleteValidate = async (req, res, next) => {
    try {
        const value = await departmentDeleteValidateSchema.validate(req.body);
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

// Department Schema

const departmentDetailsValidateSchema = Joi.object({
    department_id: Joi.string().required()
})

const departmentUpdateValidateSchema = Joi.object({
    department_id: Joi.string().required(),
    department_name: Joi.string().allow(''),
    department_image: Joi.string().allow(''),
    department_roomelement: Joi.string().allow(''),
    department_store: Joi.string().allow(''),
    status: Joi.string().allow(''),
});

const departmentDeleteValidateSchema = Joi.object({
    department_id: Joi.string().required()
})

// Room functions

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

let createRoomtextureValidate = async (req, res, next) => {
    try {
        const value = await createRoomtextureValidateSchema.validate(req.body);
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

let updateRoomtextureValidate = async (req, res, next) => {
    try {
        const value = await updateRoomtextureValidateSchema.validate(req.body);
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

let deleteRoomtextureValidate = async (req, res, next) => {
    try {
        const value = await deleteRoomtextureValidateSchema.validate(req.body);
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

let detailsRoomtextureValidate = async (req, res, next) => {
    try {
        const value = await detailsRoomtextureValidateSchema.validate(req.body);
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
            //await adminSignupValidationCheck(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

// Room Schema

const roomUpdateValidateSchema = Joi.object({
    room_id: Joi.string().required(),
    vendor_id: Joi.string().required(),
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
    }),
    status: Joi.string().allow('')
});

const roomDetailsValidateSchema = Joi.object({
    room_id: Joi.string().required()
});

const createRoomtextureValidateSchema = Joi.object({

    front: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),
    right: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),
    back: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),

    left: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),

    top: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),
    floor: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required()
        })
    ),
});

const updateRoomtextureValidateSchema = Joi.object({
    texture_id: Joi.string().required(),
    front: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),
    right: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),
    back: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),

    left: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),

    top: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),
    floor: Joi.array().items(
        Joi.object().keys({
            image: Joi.string().required(),
            image_3d: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            _id: Joi.string().required()
        })
    ),
});

const deleteRoomtextureValidateSchema = Joi.object({
    texture_id: Joi.string().required(),
});

const detailsRoomtextureValidateSchema = Joi.object({
    texture_id: Joi.string().required()
})

const roomDeleteValidateSchema = Joi.object({
    room_id: Joi.string().required(),
    vendor_id: Joi.string().required(),
})

// Vendor Functions

let adminCreateVendorValidate = async (req, res, next) => {
    try {
        const value = await adminCreateVendorValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await vendorSignupValidationCheck(req.body);
            next();
        }

    } catch (err) {
        //console.log(err);
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let adminDetailsVendorValidate = async (req, res, next) => {
    try {
        const value = await adminDetailsVendorValidateSchema.validate(req.body);
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


let adminUpdateVendorValidate = async (req, res, next) => {
    try {
        const value = await adminUpdateVendorValidateSchema.validate(req.body);
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
let adminVendorStatusValidate = async (req, res, next) => {
    try {
        const value = await adminVendorStatusValidateSchema.validate(req.body);
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

let adminVendorstoreValidate = async (req, res, next) => {
    try {
        const value = await adminVendorstoreValidateSchema.validate(req.body);
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

let adminstoreDetailsValidate = async (req, res, next) => {
    try {
        const value = await adminstoreDetailsValidateSchema.validate(req.body);
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

let vendorProductStatusChangeValidate = async (req, res, next) => {
    try {
        const value = await vendorProductStatusChangeValidateSchema.validate(req.body);
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

let vendorBulkProductStatusChangeValidate = async (req, res, next) => {
    try {
        const value = await vendorBulkProductStatusChangeValidateSchema.validate(req.body);
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

let vendorProductUpdateValidate = async (req, res, next) => {
    try {
        const value = await productUpdateValidateSchema.validate(req.body);
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

let adminVendorOrderListValidate = async (req, res, next) => {
    try {
        const value = await adminVendorOrderListValidateSchema.validate(req.body);
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


let adminvendorOrderUpdateValidate = async (req, res, next) => {
    try {
        const value = await adminvendorOrderUpdateValidateSchema.validate(req.body);
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

let adminVendorOrderDetailsValidate = async (req, res, next) => {
    try {
        const value = await adminVendorOrderDetailsValidateSchema.validate(req.body);
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

let adminVendordepartmentValidate = async (req, res, next) => {
    try {
        const value = await adminVendordepartmentValidateSchema.validate(req.body);
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

let admindepartmentDetailsValidate = async (req, res, next) => {
    try {
        const value = await admindepartmentDetailsValidateSchema.validate(req.body);
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


let adminVendorRoomValidate = async (req, res, next) => {
    try {
        const value = await adminVendorRoomValidateSchema.validate(req.body);
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
    product_id: Joi.string().required(),
    vendor_id: Joi.string().required(),
    vendor_type: Joi.string().required(),
});


// Vendor Schema

const adminCreateVendorValidateSchema = Joi.object({
    name: Joi.string()
        .required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    repeat_password: Joi.required().valid(Joi.ref('password')),
    vendor_image: Joi.allow(''),
    phone: Joi.string().required()
});

const adminDetailsVendorValidateSchema = Joi.object({
    vendor_id: Joi.string().required()

});

const adminUpdateVendorValidateSchema = Joi.object({
    vendor_id: Joi.string()
        .required(),
    name: Joi.required(),
    email: Joi.string().required(),
    vendor_image: Joi.allow(''),
    phone: Joi.string().required(),
    status: Joi.string().allow(''),
});

const adminVendorStatusValidateSchema = Joi.object({
    vendor_id: Joi.string()
        .required(),
    status: Joi.string().allow(''),
});

const adminVendorstoreValidateSchema = Joi.object({
    vendor_id: Joi.string()
        .required(),
    page: Joi.number()
        .required(),
    limit: Joi.number()
        .required()
});

const adminstoreDetailsValidateSchema = Joi.object({
    store_id: Joi.string().required()
});

const vendorProductStatusChangeValidateSchema = Joi.object({
    product_id: Joi.string().required(),
    status: Joi.string().valid('active', 'pending').required(),
})

const vendorBulkProductStatusChangeValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
    status: Joi.string().valid('active').required(),
})

const productUpdateValidateSchema = Joi.object({
    product_id: Joi.string().required(),
    product_sku: Joi.string().allow(''),
    product_slug: Joi.string().allow(''),
    product_name: Joi.string().allow(''),
    product_external_link: Joi.string().allow(''),
    product_description: Joi.allow(''),
    product_bg_color: Joi.allow(''),
    product_description: Joi.allow(''),
    product_department: Joi.string().allow(''),
    product_category: Joi.string().allow(''),
    product_sub_category: Joi.string().allow(''),
    product_child_sub_category: Joi.string().allow(''),
    product_store: Joi.string().allow(''),
    product_image: Joi.array().items(
        Joi.object().keys({
            _id: Joi.allow(''),
            pro_image: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive').required(),
            image_name: Joi.string().required(),
        })
    ),
    product_3d_image: Joi.array().items(
        Joi.object().keys({
            _id: Joi.allow(''),
            pro_3d_image: Joi.string().allow(''),
            pro_3d_image_name: Joi.string().allow(''),
            status: Joi.string().valid('active', 'inactive').allow(''),
        })
    ),
    product_varient: Joi.array().items(
        Joi.object().keys({
            varientId: Joi.string().required()
        })
    ),
    product_varient_options: Joi.array(),
    product_retail_price: Joi.number().allow(''),
    product_sale_price: Joi.number().allow(''),
    product_3dservice_status: Joi.string().valid('active', 'inactive').allow(''),
    product_stock: Joi.number().required(),
    product_updated_stock: Joi.number().required(),
    width: Joi.allow(''),
    height: Joi.allow(''),
    product_availability: Joi.string().valid('YES', 'NO').allow(''),
});

const productDeleteValidateSchema = Joi.object({
    product_id: Joi.string().required(),
    vendor_id: Joi.string().required()
});

const adminVendorOrderListValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
    page: Joi.number().required(),
    limit: Joi.number().required(),
});

const adminvendorOrderUpdateValidateSchema = Joi.object({
    order_id: Joi.string().required(),
    order_status: Joi.string().required(),
    order_delivery_date: Joi.date().required()
});

const adminVendorOrderDetailsValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
    order_id: Joi.string().required(),
});

const adminVendordepartmentValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
});

const admindepartmentDetailsValidateSchema = Joi.object({
    department_id: Joi.string().required(),
});

const adminVendorRoomValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
});

////////  User Functions


let adminCreateUserValidate = async (req, res, next) => {
    try {
        const value = await adminCreateUserValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await userSignupValidationCheck(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

let adminDetailsUserValidate = async (req, res, next) => {
    try {
        const value = await adminDetailsUserValidateSchema.validate(req.body);
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


let adminUpdateUserValidate = async (req, res, next) => {
    try {
        const value = await adminUpdateUserValidateSchema.validate(req.body);
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

let adminUserOrderListValidate = async (req, res, next) => {
    try {
        const value = await adminUserOrderListValidateSchema.validate(req.body);
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

let adminUserOrderDetailsValidate = async (req, res, next) => {
    try {
        const value = await adminUserOrderDetailsValidateSchema.validate(req.body);
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

// User Schema

const adminCreateUserValidateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().required(),
    phone: Joi.string().required()
});

const adminDetailsUserValidateSchema = Joi.object({
    user_id: Joi.string().required()

});

const adminUpdateUserValidateSchema = Joi.object({
    user_id: Joi.string()
        .required(),
    name: Joi.allow(''),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).allow(''),
    phone: Joi.string().allow(''),
    status: Joi.string().allow(''),
});

const adminUserOrderListValidateSchema = Joi.object({
    user_id: Joi.string().required(),
    page: Joi.number().required(),
    limit: Joi.number().required(),

});

const adminUserOrderDetailsValidateSchema = Joi.object({
    order_id: Joi.string().required(),
});

////////  Image Inst Functions


let adminCreateImageInstValidate = async (req, res, next) => {
    try {
        const value = await adminCreateImageInstValidateSchema.validate(req.body);
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

let adminDetailsImageInstValidate = async (req, res, next) => {
    try {
        const value = await adminDetailsImageInstValidateSchema.validate(req.body);
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


let adminUpdateImageInstValidate = async (req, res, next) => {
    try {
        const value = await adminUpdateImageInstValidateSchema.validate(req.body);
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

// Image Inst Schema

const adminCreateImageInstValidateSchema = Joi.object({
    image_instruction: Joi.string().required(),
    page_image: Joi.string().required(),
    image_size: Joi.string().required(),
    image_width: Joi.string().required(),
    image_height: Joi.string().required(),
});

const adminDetailsImageInstValidateSchema = Joi.object({
    imageinst_id: Joi.string().required()
});

const adminUpdateImageInstValidateSchema = Joi.object({
    Imageinst_id: Joi.string().required(),
    image_instruction: Joi.string().allow(''),
    page_image: Joi.string().allow(''),
    image_size: Joi.string().allow(''),
    image_width: Joi.string().allow(''),
    image_height: Joi.string().allow(''),
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

let bannersepartmentValidate = async (req, res, next) => {
    try {
        const value = await bannersepartmentValidateSchema.validate(req.body);
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
    banner_store: Joi.string().allow(...['', null]),
    banner_department: Joi.string().allow(...['', null]),
    banner_title_color: Joi.string().allow(...['', null]),
    banner_subtitle_color: Joi.string().allow(...['', null]),
    banner_button_bg_color: Joi.string().allow(...['', null]),
    banner_button_text_color: Joi.string().allow(...['', null]),
    banner_background_image: Joi.string().required(),
});

const bannerDetailsValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
});

const bannerUpdateValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
    banner_title: Joi.string().allow(...['', null]),
    banner_subtitle: Joi.string().allow(...['', null]),
    banner_store: Joi.string().allow(...['', null]),
    banner_department: Joi.string().allow(...['', null]),
    banner_title_color: Joi.string().allow(...['', null]),
    banner_subtitle_color: Joi.string().allow(...['', null]),
    banner_button_bg_color: Joi.string().allow(...['', null]),
    banner_button_text_color: Joi.string().allow(...['', null]),
    banner_background_image: Joi.string().allow(''),
});

const bannerDeleteValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
});

const bannersepartmentValidateSchema = Joi.object({
    store_slug: Joi.string().required(),
});


let bannerStatusChangeValidate = async (req, res, next) => {
    try {
        const value = await bannerStatusChangeValidateSchema.validate(req.body);
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


const bannerStatusChangeValidateSchema = Joi.object({
    banner_id: Joi.string().required(),
    status: Joi.string().required()
});

let adminbannerlistValidate = async (req, res, next) => {
    try {
        const value = await adminbannerlistValidateSchema.validate(req.body);
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


const adminbannerlistValidateSchema = Joi.object({
    vendor_id: Joi.string().required(),
});


const CategoriescreateValidateSchema = Joi.object({
    category_name: Joi.string().required(),
    category_image: Joi.string().allow(''),
    category_image_name: Joi.string().allow(''),
    child_categories: Joi.array().allow(''),
    attributes: Joi.array().items(attributesDetails).allow(''),
    attributes_json_name: Joi.string().allow(''),
    add_ons: Joi.array().items(addOns).allow(''),
    add_ons_json_name: Joi.string().allow(''),
});

let CategoryCreateValidate = async (req, res, next) => {
    try {
        const value = await CategoriescreateValidateSchema.validate(req.body);
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
const CategoriescUpdateValidateSchema = Joi.object({
    category_id: Joi.required(),
    category_name: Joi.string().required(),
    category_image: Joi.string().allow(''),
    category_image_name: Joi.string().allow(''),
    child_categories: Joi.array().items(subcategoryDetails).allow(''),
    attributes: Joi.array().items(attributesDetails).allow(''),
    attributes_json_name: Joi.string().allow(''),
    add_ons: Joi.array().items(addOns).allow(''),
    add_ons_json_name: Joi.string().allow(''),
});

let CategoryUpdateValidate = async (req, res, next) => {
    try {
        const value = await CategoriescUpdateValidateSchema.validate(req.body);
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
const CategoriesdeleteValidateSchema = Joi.object({
    category_id: Joi.string().required(),
});

let catagoryDetailsValidate = async (req, res, next) => {
    try {
        const value = await CategoriescDetailsValidateSchema.validate(req.body);
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
const CategoriescDetailsValidateSchema = Joi.object({
    category_id: Joi.string().required(),
});

let CategoryDeleteValidate = async (req, res, next) => {
    try {
        const value = await CategoriesdeleteValidateSchema.validate(req.body);
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

const SubCategoriescreateValidateSchema = Joi.object({
    category_id: Joi.required(),
    child_categories_id: Joi.required(''),
    child_category_name: Joi.required(),
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

const SubCategoriesUpdateValidateSchema = Joi.object({
    category_id: Joi.required(),
    child_categories_id: Joi.required(),
    child_category_name: Joi.required(),
});

let SubCategoryUpdateValidate = async (req, res, next) => {
    try {
        const value = await SubCategoriesUpdateValidateSchema.validate(req.body);
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

const subCategoriesdeleteValidateSchema = Joi.object({
    category_id: Joi.string().required(),
    child_categories_id: Joi.string().required(),
});


let subcatagoryDetailsValidate = async (req, res, next) => {
    try {
        const value = await subcatagoryDetailsValidateSchema.validate(req.body);
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
const subcatagoryDetailsValidateSchema = Joi.object({
    subcategory_id: Joi.string().required(),
});


let subCategoryDeleteValidate = async (req, res, next) => {
    try {
        const value = await subCategoriesdeleteValidateSchema.validate(req.body);
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


const brandAddValidateSchema = Joi.object({
    brand_name: Joi.string().required(),
    brand_image: Joi.string().allow(null),
    brand_image_name: Joi.string().allow(null),
    categories: Joi.array().allow(null)
});


let brandAddValidate = async (req, res, next) => {
    try {
        const value = await brandAddValidateSchema.validate(req.body);
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


const brandDetailsValidateSchema = Joi.object({
    brand_id: Joi.string().required(),
});


let brandDetailsValidate = async (req, res, next) => {
    try {
        const value = await brandDetailsValidateSchema.validate(req.body);
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

const brandUpdateValidateSchema = Joi.object({
    brand_id: Joi.string().required(),
    categories: Joi.array().allow(null),
    brand_name: Joi.string().allow(null),
    brand_image: Joi.string().allow(null),
    brand_image_name: Joi.string().allow(null),
    status: Joi.string().allow(null),
});


let brandUpdateValidate = async (req, res, next) => {
    try {
        const value = await brandUpdateValidateSchema.validate(req.body);
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

const brandDeleteValidateSchema = Joi.object({
    brand_id: Joi.string().required(),
    status: Joi.string().required(),
});


let brandDeleteValidate = async (req, res, next) => {
    try {
        const value = await brandDeleteValidateSchema.validate(req.body);
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

let vendoradminLoginValidate = async (req, res, next) => {
    try {
        const value = await vendoradminLoginValidateSchema.validate(req.body);
        if (value.hasOwnProperty('error')) {
            const errorMessage = value.error.details.map(detail => detail.message).join(', ');
            throw new Error(errorMessage); // Throw the cleaned up message
        } else {
            await getVendorAdminDetails(req.body);
            next();
        }
    } catch (err) {
        let apiResponse = responseLib.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


const vendoradminLoginValidateSchema = Joi.object({
    email: Joi.string()
        .required(),
    password: Joi.string().required()
});


let addTagValidate = async (req, res, next) => {
    try {
        const value = await addTagValidateSchema.validate(req.body);
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


const addTagValidateSchema = Joi.object({
    tag_name: Joi.string().required(),
    tag_image: Joi.string().allow(null),
    tag_image_name: Joi.string().allow(null),
    tag_description: Joi.string().allow(null),
    web_view_status: Joi.string().valid('active', 'inactive').allow(null)
});



let tagDetailsValidate = async (req, res, next) => {
    try {
        const value = await tagDetailsValidateSchema.validate(req.body);
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


const tagDetailsValidateSchema = Joi.object({
    tag_id: Joi.string().required()
});


let updateTagValidate = async (req, res, next) => {
    try {
        const value = await updateTagValidateSchema.validate(req.body);
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


const updateTagValidateSchema = Joi.object({
    tag_id: Joi.string().required(),
    tag_name: Joi.string().allow(),
    tag_image: Joi.string().allow(null),
    tag_image_name: Joi.string().allow(null),
    tag_description: Joi.string().allow(null),
    web_view_status: Joi.string().valid('active', 'inactive').allow(null),
    status: Joi.string().valid('active', 'inactive', 'pending', 'deleted').allow(null),
});



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
    tag_List: Joi.array().allow(null),
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
});



module.exports = {
    adminLoginValidate: adminLoginValidate,
    adminCreateValidate: adminCreateValidate,
    storeValidate: storeValidate,
    storeDetailsValidate: storeDetailsValidate,
    storeUpdateValidate: storeUpdateValidate,
    storeDeleteValidate: storeDeleteValidate,
    departmentUpdateValidate: departmentUpdateValidate,
    departmentDetailsValidate: departmentDetailsValidate,
    departmentDeleteValidate: departmentDeleteValidate,
    roomUpdateValidate: roomUpdateValidate,
    roomDetailsValidate: roomDetailsValidate,
    roomDeleteValidate: roomDeleteValidate,
    createRoomtextureValidate: createRoomtextureValidate,
    updateRoomtextureValidate: updateRoomtextureValidate,
    detailsRoomtextureValidate: detailsRoomtextureValidate,
    deleteRoomtextureValidate: deleteRoomtextureValidate,
    adminCreateVendorValidate: adminCreateVendorValidate,
    adminDetailsVendorValidate: adminDetailsVendorValidate,
    adminUpdateVendorValidate: adminUpdateVendorValidate,
    adminVendorStatusValidate: adminVendorStatusValidate,
    adminVendorstoreValidate: adminVendorstoreValidate,
    adminstoreDetailsValidate: adminstoreDetailsValidate,
    adminVendordepartmentValidate: adminVendordepartmentValidate,
    admindepartmentDetailsValidate: admindepartmentDetailsValidate,
    adminVendorRoomValidate: adminVendorRoomValidate,
    productActivationValidate: productActivationValidate,
    adminCreateUserValidate: adminCreateUserValidate,
    adminDetailsUserValidate: adminDetailsUserValidate,
    adminUpdateUserValidate: adminUpdateUserValidate,
    adminCreateImageInstValidate: adminCreateImageInstValidate,
    adminDetailsImageInstValidate: adminDetailsImageInstValidate,
    adminUpdateImageInstValidate: adminUpdateImageInstValidate,
    bannerCreateValidate: bannerCreateValidate,
    bannerDetailsValidate: bannerDetailsValidate,
    bannerUpdateValidate: bannerUpdateValidate,
    bannerDeleteValidate: bannerDeleteValidate,
    bannersepartmentValidate: bannersepartmentValidate,
    adminVendorProductValidate: adminVendorProductValidate,
    vendorProductUpdateValidate: vendorProductUpdateValidate,
    vendorProductStatusChangeValidate: vendorProductStatusChangeValidate,
    vendorBulkProductStatusChangeValidate: vendorBulkProductStatusChangeValidate,
    vendorProductDeleteValidate: vendorProductDeleteValidate,
    adminVendorOrderListValidate: adminVendorOrderListValidate,
    adminvendorOrderUpdateValidate: adminvendorOrderUpdateValidate,
    adminVendorOrderDetailsValidate: adminVendorOrderDetailsValidate,
    adminUserOrderListValidate: adminUserOrderListValidate,
    adminUserOrderDetailsValidate: adminUserOrderDetailsValidate,
    bannerStatusChangeValidate: bannerStatusChangeValidate,
    adminbannerlistValidate: adminbannerlistValidate,
    CategoryCreateValidate: CategoryCreateValidate,
    CategoryUpdateValidate: CategoryUpdateValidate,
    catagoryDetailsValidate: catagoryDetailsValidate,
    CategoryDeleteValidate: CategoryDeleteValidate,
    SubCategoryCreateValidate: SubCategoryCreateValidate,
    SubCategoryUpdateValidate: SubCategoryUpdateValidate,
    subcatagoryDetailsValidate: subcatagoryDetailsValidate,
    subCategoryDeleteValidate: subCategoryDeleteValidate,
    brandAddValidate: brandAddValidate,
    brandDetailsValidate: brandDetailsValidate,
    brandUpdateValidate: brandUpdateValidate,
    brandDeleteValidate: brandDeleteValidate,
    vendoradminLoginValidate: vendoradminLoginValidate,
    addTagValidate: addTagValidate,
    tagDetailsValidate: tagDetailsValidate,
    updateTagValidate: updateTagValidate,
    addMediaTextContentValidate: addMediaTextContentValidate,
    mediaTextContentDetailsValidate: mediaTextContentDetailsValidate,
    updateMediaTextContentValidate: updateMediaTextContentValidate,
}
