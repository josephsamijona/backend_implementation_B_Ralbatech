const response = require("../../libs/responseLib");

// Import Model
const time = require('../../libs/timeLib');
const Store = require('../../models/storeModel');
const Roomtexture = require('../../models/roomTextureMasterModel');
const Room = require('../../models/roomModel');
const Tag = require('../../models/tagModel');
const Product = require('../../models/productModel');
const StoreView = require('../../models/storeViewModel');
const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const VendorMediaTextContentModel = require('../../models/vendorMediaTextContentModel');
const MediaTextContentModel = require('../../models/mediaTextContentModel');
const mongoose = require('mongoose');
const commonLib = require("../../libs/commonLib");
const checkLib = require("../../libs/checkLib");


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName storeList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeList = async (req, res) => {

    let skip = 0;
    let limit = parseInt(req.body.limit);
    if (req.body.page > 1) {
        skip = req.body.page - 1 * limit;
    }
    try {
        let record = await Store.find({ status: 'active' }).populate('store_owner', 'name status').populate('store_department', 'department_name department_slug department_image status').lean();
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
    * @Modified_by 
    * @function async
    * @functionName configurationList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let configurationList = async (req, res) => {
    let roomList = await Room.aggregate([{
        $match: {
            $and: [
                { status: 'active' },
                { department: mongoose.Types.ObjectId(req.body.department_id) },
                { vendor: mongoose.Types.ObjectId(req.body.vendor_id) },
            ]
        }
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
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.front._id",
            foreignField: "texture_images.front._id",
            as: "room_texture.front"
        }
    },
    {
        $unwind: "$room_texture.front"
    },
    {
        $unwind: "$room_texture.front.texture_images"
    },
    {
        $unwind: "$room_texture.front.texture_images.front"
    },

    {
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.right._id",
            foreignField: "texture_images.right._id",
            as: "room_texture.right"
        }
    },
    {
        $unwind: "$room_texture.right"
    },
    {
        $unwind: "$room_texture.right.texture_images"
    },
    {
        $unwind: "$room_texture.right.texture_images.right"
    },

    {
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.back._id",
            foreignField: "texture_images.back._id",
            as: "room_texture.back"
        }
    },
    {
        $unwind: "$room_texture.back"
    },
    {
        $unwind: "$room_texture.back.texture_images"
    },
    {
        $unwind: "$room_texture.back.texture_images.back"
    },

    {
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.left._id",
            foreignField: "texture_images.left._id",
            as: "room_texture.left"
        }
    },
    {
        $unwind: "$room_texture.left"
    },
    {
        $unwind: "$room_texture.left.texture_images"
    },
    {
        $unwind: "$room_texture.left.texture_images.left"
    },

    {
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.top._id",
            foreignField: "texture_images.top._id",
            as: "room_texture.top"
        }
    },
    {
        $unwind: "$room_texture.top"
    },
    {
        $unwind: "$room_texture.top.texture_images"
    },
    {
        $unwind: "$room_texture.top.texture_images.top"
    },

    {
        $lookup: {
            from: "roomtexturemasters",
            localField: "texture.floor._id",
            foreignField: "texture_images.floor._id",
            as: "room_texture.floor"
        }
    },
    {
        $unwind: "$room_texture.floor"
    },
    {
        $unwind: "$room_texture.floor.texture_images"
    },
    {
        $unwind: "$room_texture.floor.texture_images.floor"
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
            "roomelement_configaration": 0,
            "roomelement.roomelement_configaration": 0,
            "roomesize.status": 0,
            "roomesize.createdAt": 0,
            "roomesize.updatedAt": 0,
            "roomesize.__v": 0,

            "room_texture.front._id": 0,
            "room_texture.front.status": 0,
            "room_texture.front.createdAt": 0,
            "room_texture.front.updatedAt": 0,
            "room_texture.front.__v": 0,
            "room_texture.front.texture_images.right": 0,
            "room_texture.front.texture_images.back": 0,
            "room_texture.front.texture_images.left": 0,
            "room_texture.front.texture_images.top": 0,
            "room_texture.front.texture_images.floor": 0,

            "room_texture.right._id": 0,
            "room_texture.right.status": 0,
            "room_texture.right.createdAt": 0,
            "room_texture.right.updatedAt": 0,
            "room_texture.right.__v": 0,
            "room_texture.right.texture_images.front": 0,
            "room_texture.right.texture_images.back": 0,
            "room_texture.right.texture_images.left": 0,
            "room_texture.right.texture_images.top": 0,
            "room_texture.right.texture_images.floor": 0,

            "room_texture.back._id": 0,
            "room_texture.back.status": 0,
            "room_texture.back.createdAt": 0,
            "room_texture.back.updatedAt": 0,
            "room_texture.back.__v": 0,
            "room_texture.back.texture_images.right": 0,
            "room_texture.back.texture_images.front": 0,
            "room_texture.back.texture_images.left": 0,
            "room_texture.back.texture_images.top": 0,
            "room_texture.back.texture_images.floor": 0,

            "room_texture.left._id": 0,
            "room_texture.left.status": 0,
            "room_texture.left.createdAt": 0,
            "room_texture.left.updatedAt": 0,
            "room_texture.left.__v": 0,
            "room_texture.left.texture_images.right": 0,
            "room_texture.left.texture_images.front": 0,
            "room_texture.left.texture_images.back": 0,
            "room_texture.left.texture_images.top": 0,
            "room_texture.left.texture_images.floor": 0,

            "room_texture.top._id": 0,
            "room_texture.top.status": 0,
            "room_texture.top.createdAt": 0,
            "room_texture.top.updatedAt": 0,
            "room_texture.top.__v": 0,
            "room_texture.top.texture_images.right": 0,
            "room_texture.top.texture_images.front": 0,
            "room_texture.top.texture_images.back": 0,
            "room_texture.top.texture_images.left": 0,
            "room_texture.top.texture_images.floor": 0,

            "room_texture.floor._id": 0,
            "room_texture.floor.status": 0,
            "room_texture.floor.createdAt": 0,
            "room_texture.floor.updatedAt": 0,
            "room_texture.floor.__v": 0,
            "room_texture.floor.texture_images.right": 0,
            "room_texture.floor.texture_images.front": 0,
            "room_texture.floor.texture_images.back": 0,
            "room_texture.floor.texture_images.left": 0,
            "room_texture.floor.texture_images.top": 0,

            "texture": 0,
            "createdAt": 0,
            "updatedAt": 0,
            "__v": 0,

        }

    },
    ]);
    if (roomList.length > 0) {
        let apiResponse = response.generate(0, ` Success`, roomList[0]);
        res.status(200);
        res.send(apiResponse);
    } else {
        let apiResponse = response.generate(0, ` Success`, {});
        res.status(200);
        res.send(apiResponse);
    }

}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName product3dlist
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let product3dlist = async (req, res) => {
    try {
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }
        record = await Product.aggregate([{
            $match: {
                $and: [
                    { $or: [{ status: 'active' }, { status: 'pending' }] },
                    { product_category: contactCategory._id.toString() },
                    { product_department: mongoose.Types.ObjectId(req.body.department_id) },
                    { product_owner: mongoose.Types.ObjectId(req.body.vendor_id) }
                ]
            }
        },
        {
            $lookup: {
                from: "departments",
                localField: "product_department",
                foreignField: "_id",
                as: "product_department",
            }
        },
        { $unwind: '$product_department' },
        {
            $lookup: {
                from: "categories",
                localField: "product_category",
                foreignField: "_id",
                as: "product_category",
            }
        },
        { $unwind: '$product_category' },
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
                from: "stores",
                localField: "product_store",
                foreignField: "_id",
                as: "product_store",
            }
        },
        { $unwind: '$product_store' },
        {
            $lookup: {
                from: "varients",
                localField: "product_varient.varientId",
                foreignField: "_id",
                as: "product_varient",
            }
        },

        {
            "$project": {
                "_id": 1,
                "product_name": 1,
                "product_slug": 1,
                "product_sku": 1,
                "product_description": 1,
                "product_department._id": 1,
                "product_department.department_name": 1,
                "product_department.department_image": 1,
                "product_department.status": 1,

                "product_category._id": 1,
                "product_category.category_name": 1,
                "product_category.category_slug": 1,
                "product_category.status": 1,

                "product_owner._id": 1,
                "product_owner.name": 1,

                "product_store._id": 1,
                "product_store.store_name": 1,

                "product_varient._id": 1,
                "product_varient.varient_name": 1,
                "product_varient_options": 1,

                "product_image": 1,
                "product_tryon_2d_image": 1,
                "product_3d_image": 1,
                "product_store_3d_image": 1,
                "product_tryon_3d_image": 1,
                "product_retail_price": 1,
                "product_sale_price": 1,
                "product_availibility": 1,
                "status": 1,

                "createdAt": 1,
                "updatedAt": 1

            }
        }

        ]);
        let product3d_list = record.filter(elem => {
            if (elem.product_3d_image) {
                if (!checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
                    return true
            }
            else {
                return false
            }
        }

        );
        let apiResponse = response.generate(0, ` Success`, { product_count: product3d_list.length, product_list: product3d_list });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` Success`, []);
        res.status(200);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName roomconfigurationList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomconfigurationList = async (req, res) => {
    try {
        //let roomList = await Room.find({$and : [{status: 'active'},{vendor: req.user.vendor_id}]}).lean();
        let roomList = await Room.aggregate([{
            $match: {
                $and: [
                    { status: 'active' },
                    { department: mongoose.Types.ObjectId(req.body.department_id) },
                    { vendor: mongoose.Types.ObjectId(req.body.vendor_id) },
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

            let results = await Promise.all(roomList[0].texture.map(async (eachObj) => {

                eachObj["front"] = await textureDetails(eachObj.front._id, 'front');
                eachObj["right"] = await textureDetails(eachObj.right._id, 'right');
                eachObj["back"] = await textureDetails(eachObj.back._id, 'back');
                eachObj["left"] = await textureDetails(eachObj.left._id, 'left');
                eachObj["top"] = await textureDetails(eachObj.top._id, 'top');
                eachObj["floor"] = await textureDetails(eachObj.floor._id, 'floor');
                return eachObj;
            }));


            let apiResponse = response.generate(0, ` Success`, roomList[0]);
            res.status(200);
            res.send(apiResponse);
        } else {
            let apiResponse = response.generate(0, ` Success`, {});
            res.status(200);
            res.send(apiResponse);
        }
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
    * @Modified_by 
    * @function async
    * @functionName textureDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let textureDetails = async (ordinate, orval) => {
    try {

        let texture_list = await Roomtexture.find().lean();
        let texture_images = texture_list[0].texture_images;
        let image = '';
        let image_3d = '';
        let _id = '';

        for (ele of texture_images) {

            let key = ele[orval];
            for (keyele of key) {

                if (keyele._id.toString() == ordinate.toString()) {
                    image = keyele.image;
                    image_3d = keyele.image_3d;
                    _id = keyele._id;
                }
            }
        }

        return { _id: _id, image: image, image_3d: image_3d };

    } catch (err) {

    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName storeViewCount
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeViewCount = async (req, res) => {
    let newStoreView = new StoreView({
        vendor_id: mongoose.Types.ObjectId(req.body.vendor_id),
        store_id: mongoose.Types.ObjectId(req.body.store_id)
    });
    await newStoreView.save((err, newStoreView) => {

        let apiResponse = response.generate(0, ` Success`, newStoreView);
        res.status(200);
        res.send(apiResponse);
    });
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName vendorRoomCheck
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorRoomCheck = async (req, res) => {
    try {
        let roomList = await Room.countDocuments({ $and: [{ status: 'active' }, { vendor: req.body.vendor_id }] }).lean();
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
    * @Modified_by 
    * @function async
    * @functionName storeDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeDetails = async (req, res) => {
    try {
        let storeDetails = await Store.find({ store_slug: req.body.store_slug }).lean();
        let apiResponse = response.generate(0, ` Success`, storeDetails);
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
    * @Modified_by 
    * @function async
    * @functionName vendorstoreDetails
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let vendorstoreDetails = async (req, res) => {
    try {
        let storeDetails = await Store.find({ "store_slug": req.body.store_slug, "status": "active" }).lean();
        let apiResponse = response.generate(0, ` Success`, storeDetails);
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
    * @Modified_by 
    * @function async
    * @functionName product3dlistVendor
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let product3dlistVendor = async (req, res) => {
    try {
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        record = await Product.aggregate([{
            $match: {
                $and: [
                    { $or: [{ status: 'active' }, { status: 'pending' }] },
                    { product_category: contactCategory._id.toString() },
                    { product_owner: mongoose.Types.ObjectId(req.body.vendor_id) }
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
            "$project": {
                "_id": 1,
                "product_name": 1,
                "product_slug": 1,
                "product_sku": 1,
                "product_description": 1,
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
                "status": 1,
                "createdAt": 1,
                "updatedAt": 1

            }
        }

        ]);
        let storeDetails = await Store.findOne({ $and: [{ $or: [{ status: "pending" }, { status: "active" }] }, { store_owner: mongoose.Types.ObjectId(req.body.vendor_id) }] }).lean();
        //console.log(record)

        let product3d_list = record.filter(product => product.product_3d_image && product.product_3d_image.length > 0);
        product3d_list = await product3d_list.filter(e => {
            if (storeDetails.store_products.length) {
                for (let item of storeDetails.store_products) {
                    if (item.findIndex(sp => sp.product_sku == e.product_sku) > -1)
                        return false;
                }
            }
            return true;


        })

        // await Promise.all(product3d_list.map(async item => {
        //     let categoryDetails;

        //     item.product_category = item.product_category.toString();
        //     if (Buffer.from(item.product_category).length == 12 || Buffer.from(item.product_category).length == 24) {
        //         categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(item.product_category) });
        //         item.product_category_id = item.product_category;
        //         item.product_category_name = categoryDetails.category_name;
        //         item.product_category = categoryDetails;
        //     } else {
        //         categoryDetails = await Category.find();
        //         categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', item.product_category);
        //         item.product_category_id = item.product_category;
        //         item.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', item.product_category).category_name;
        //         item.product_category = categoryDetails;
        //     }
        // }))
        //console.log(product3d_list)
        let apiResponse = response.generate(0, ` Success`, { product_count: product3d_list.length, product_list: product3d_list });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        //console.log(err)
        let apiResponse = response.generate(1, ` Error`, []);
        res.status(200);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName product3dlistAllVendor
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let product3dlistAllVendor = async (req, res) => {
    try {
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        record = await Product.aggregate([{
            $match: {
                $and: [
                    { $or: [{ status: 'active' }, { status: 'pending' }] },
                    { product_category: contactCategory._id.toString() },
                    { product_owner: mongoose.Types.ObjectId(req.body.vendor_id) }
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
            "$project": {
                "_id": 1,
                "product_name": 1,
                "product_slug": 1,
                "product_sku": 1,
                "product_description": 1,
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
                "status": 1,
                "createdAt": 1,
                "updatedAt": 1

            }
        }
        ]);

        let all_product3d_list = JSON.parse(JSON.stringify(record));
        let product2d_list = all_product3d_list.filter(elem => {
            if (elem.product_3d_image) {

                if (checkLib.isEmpty(elem.product_3d_image[0]) || checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
                    return true
            }
            else {
                return false
            }
        }

        );
        let product3d_list = record.filter(elem => {
            if (elem.product_3d_image) {
                if (!checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
                    return true
            }
            else {
                return false
            }
        }
        );

        // await Promise.all(product3d_list.map(async item => {
        //     let categoryDetails;

        //     item.product_category = item.product_category.toString();
        //     if (Buffer.from(item.product_category).length == 12 || Buffer.from(item.product_category).length == 24) {
        //         categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(item.product_category) });
        //         item.product_category_id = item.product_category;
        //         item.product_category_name = categoryDetails.category_name;
        //         item.product_category = categoryDetails;
        //     } else {
        //         categoryDetails = await Category.find();
        //         categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', item.product_category);
        //         item.product_category_id = item.product_category;
        //         item.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', item.product_category).category_name;
        //         item.product_category = categoryDetails;
        //     }
        // }))
        //console.log(product3d_list)
        let apiResponse = response.generate(0, ` Success`, { product_count: product3d_list.length, product_list: product3d_list, product2d_list: product2d_list });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        //console.log(err)
        let apiResponse = response.generate(1, ` Error`, []);
        res.status(200);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName product3dlistAllVendorForUser
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let product3dlistAllVendorForUser = async (req, res) => {
    try {
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        record = await Product.aggregate([{
            $match: {
                $and: [
                    { status: 'active' },
                    { product_category: contactCategory._id.toString() },
                    { product_owner: mongoose.Types.ObjectId(req.body.vendor_id) }
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
            "$project": {
                "_id": 1,
                "product_name": 1,
                "product_slug": 1,
                "product_sku": 1,
                "product_description": 1,
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
                "status": 1,

                "createdAt": 1,
                "updatedAt": 1

            }
        }

        ]);
        let all_product3d_list = JSON.parse(JSON.stringify(record));
        let product3d_list = record.filter(elem => {
            if (elem.product_3d_image) {
                if (!checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
                    return true
            }
            else {
                return false
            }
        }

        );
        //console.log('all_product3d_list --------------------------', all_product3d_list)
        let product2d_list = all_product3d_list.filter(elem => {
            if (elem.product_3d_image) {
                if (checkLib.isEmpty(elem.product_3d_image[0]) || checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
                    return true
            }
            else {
                return false
            }
        }

        );
        await Promise.all(product3d_list.map(async item => {
            let categoryDetails;

            item.product_category = item.product_category.toString();
            if (Buffer.from(item.product_category).length == 12 || Buffer.from(item.product_category).length == 24) {
                categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(item.product_category) });
                item.product_category_id = item.product_category;
                item.product_category_name = categoryDetails.category_name;
                item.product_category = categoryDetails;
            } else {
                categoryDetails = await Category.find();
                categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', item.product_category);
                item.product_category_id = item.product_category;
                item.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', item.product_category).category_name;
                item.product_category = categoryDetails;
            }
        }))
        //console.log(product3d_list)
        let apiResponse = response.generate(0, ` Success`, { product_count: product3d_list.length, product_list: product3d_list, product2d_list: product2d_list });
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        //console.log(err)
        let apiResponse = response.generate(1, ` Error`, []);
        res.status(200);
        res.send(apiResponse);
    }
}


// let product2dlistAllVendorForUser = async (req, res) => {
//     try {
//         let storeDetails = await Store.findOne({ store_slug: req.body.store_slug }).lean();
//         if (!storeDetails) {
//             res.status(404);
//             throw new Error('Please Provide a vallid Store Slug');
//         }
//         record = await Product.aggregate([{
//             $match: {
//                 $and: [
//                     { $or: [{ status: 'active' }, { status: 'pending' }] },
//                     { product_owner: mongoose.Types.ObjectId(storeDetails.store_owner) }
//                 ]
//             }
//         },

//         {
//             $lookup: {
//                 from: "vendors",
//                 localField: "product_owner",
//                 foreignField: "_id",
//                 as: "product_owner",
//             }
//         },
//         { $unwind: '$product_owner' },
//         {
//             "$project": {
//                 "_id": 1,
//                 "product_name": 1,
//                 "product_slug": 1,
//                 "product_sku": 1,
//                 "product_description": 1,
//                 "product_category": 1,
//                 "product_owner._id": 1,
//                 "product_owner.name": 1,
//                 "product_image": 1,
//                 "product_tryon_2d_image": 1,
//                 "product_3d_image": 1,
//                 "product_store_3d_image": 1,
//                 "product_tryon_3d_image": 1,
//                 "product_retail_price": 1,
//                 "product_sale_price": 1,
//                 "product_availibility": 1,
//                 "status": 1,
//                 "createdAt": 1,
//                 "updatedAt": 1

//             }
//         }

//         ]);

//         let all_product3d_list = JSON.parse(JSON.stringify(record));
//         //console.log('all_product3d_list===========================', all_product3d_list.length)

//         let product2d_list = all_product3d_list.filter(elem => {
//             // //console.log('elem ---------------------------------',elem);
//             if (elem.product_3d_image) {
//                 if (checkLib.isEmpty(elem.product_3d_image[0]) || checkLib.isEmpty(elem.product_3d_image[0].pro_3d_image))
//                     return true
//             }
//             else {
//                 return false
//             }
//         }

//         );

//         //console.log('product2d_list =======================', product2d_list);
//         await Promise.all(product2d_list.map(async item => {
//             let categoryDetails;

//             item.product_category = item.product_category.toString();
//             if (Buffer.from(item.product_category).length == 12 || Buffer.from(item.product_category).length == 24) {
//                 categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(item.product_category) });
//                 item.product_category_id = item.product_category;
//                 item.product_category_name = categoryDetails.category_name;
//                 item.product_category = categoryDetails;
//             } else {
//                 categoryDetails = await Category.find();
//                 categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', item.product_category);
//                 item.product_category_id = item.product_category;
//                 item.product_category_name = await commonLib.findNestedObj(categoryDetails, 'category_id', item.product_category).category_name;
//                 item.product_category = categoryDetails;
//             }
//         }))
//         //console.log(product3d_list)
//         let apiResponse = response.generate(0, ` Success`, { product_count: product2d_list.length, product_list: product2d_list });
//         res.status(200);
//         res.send(apiResponse);
//     } catch (err) {
//         //console.log(err)
//         let apiResponse = response.generate(1, ` Error`, []);
//         res.status(200);
//         res.send(apiResponse);
//     }
// }

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by 
    * @function async
    * @functionName product2dlistAllVendorForUser
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let product2dlistAllVendorForUser = async (req, res) => {

    try {
        let store_details = await Store.find({ "store_slug": req.body.store_slug, "status": 'active' }).lean();

        if (checkLib.isEmpty(store_details)) {
            throw new Error('Store is Empty');
        }

        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        let vendor_id = store_details[0].is_copy ? store_details[0].main_vendor_id : store_details[0].store_owner;
        let record;
        let page = parseInt(req.body.page) || 1; // Default to page 1 if not provided
        let limit = parseInt(req.body.limit) || 9; // Default to 9 items per page if not provided
        let skip = (page - 1) * limit; // Calculate how many records to skip

        const matchConditions = {
            "status": 'active',
            "product_category": contactCategory._id.toString(),
            "product_owner": mongoose.Types.ObjectId(vendor_id)
        };

        if (req.body.brand) {
            matchConditions.product_brand = mongoose.Types.ObjectId(req.body.brand);
        }

        // Check if product_category is provided
        if (req.body.product_category) {
            matchConditions.product_sub_categories = {
                $elemMatch: {
                    child_category_id: req.body.product_category
                }
            };
        }

        record = await Product.aggregate([
            { $match: matchConditions },
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
                // Match products without valid 3D images
                $match: {
                    $or: [
                        { "product_3d_image": { $exists: false } }, // No 3D image field
                        {
                            "product_3d_image": {
                                $elemMatch: {
                                    "pro_3d_image": { $eq: "" }, // 3D image is empty
                                    "_id": { $eq: "" }, // ID is empty
                                    "pro_3d_image_name": { $eq: "" }, // Name is empty
                                    "status": "active" // Ensure status is active
                                }
                            }
                        }
                    ]
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "product_sku": 1,
                    "product_name": 1,
                    "product_slug": 1,
                    "product_description": 1,
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
                    "stock": 1,
                    "status": 1,
                    "attributes": 1,
                    "add_ons": 1,
                    "is_addons_required": 1,
                    "is_custom_addons": 1,
                    "createdAt": 1,
                    "updatedAt": 1
                }
            },
            { $skip: skip }, // Skip records for pagination
            { $limit: limit } // Limit the number of records returned
        ]);

        // Get the total count of 2D products matching the conditions
        let total2DCount = await Product.aggregate([
            {
                $match: matchConditions
            },
            {
                $match: {
                    $or: [
                        { "product_3d_image": { $exists: false } }, // No 3D image field
                        {
                            "product_3d_image": {
                                $elemMatch: {
                                    "pro_3d_image": { $eq: "" }, // 3D image is empty
                                    "_id": { $eq: "" }, // ID is empty
                                    "pro_3d_image_name": { $eq: "" }, // Name is empty
                                    "status": "active" // Ensure status is active
                                }
                            }
                        }
                    ]
                }
            },
            {
                $count: "total"
            }
        ]);

        // If the aggregation result is empty, set total2DCount to 0; otherwise, get the count
        let totalCount = total2DCount.length > 0 ? total2DCount[0].total : 0;

        let apiResponse;
        if (record.length > 0) {
            apiResponse = response.generate(0, `Success`, { products: record, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) });
        } else {
            apiResponse = response.generate(0, `Success`, {});
        }

        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410).send(apiResponse);
    }

}


let findCategoryIdBySlug = (categoryObj, targetSlug) => {
    if (categoryObj.category_slug == targetSlug) {
        // //console.log('categoryObj===',categoryObj);
        if (categoryObj._id) {
            return categoryObj._id;
        }
        else {
            return categoryObj.category_id;
        }

    }

    for (let childCategory of categoryObj.child_categories) {
        let result = findCategoryIdBySlug(childCategory, targetSlug);
        if (result !== null) {
            return result;
        }
    }

    return null;
}


/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by Munnaf Hossain Mondal
    * @function async
    * @functionName categoryList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let categoryList = async (req, res) => {

    try {
        let record = await Category.find({ status: 'active' });
        let allCategoryData = [];
        for (const iterator of record) {
            let categorywiseData = [];
            getAllCategoryWithSubCat(iterator, categorywiseData);
            allCategoryData.push(categorywiseData);
        }
        //console.log('allCategoryData =============', allCategoryData)
        let apiResponse = response.generate(0, ` Success`, allCategoryData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Munnaf
    * @Date_Created 
    * @Date_Modified 
    * @Modified_by Munnaf Hossain Mondal
    * @function async
    * @functionName categoryList
    * @functionPurpose  
    *                                                  
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let eyeglascategoryList = async (req, res) => {

    try {
        let record = await Category.find({ status: 'active', category_slug: 'eyeglass' });
        let allCategoryData = [];
        for (const iterator of record) {
            let categorywiseData = [];
            getAllCategoryWithSubCat(iterator, categorywiseData);
            allCategoryData.push(categorywiseData);
        }
        let apiResponse = response.generate(0, ` Success`, allCategoryData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

let getAllCategoryWithSubCat = (data, result) => {
    let child = data.child_categories;
    delete data.child_categories;
    // //console.log(child);
    result.push(data)
    if (child && child.length)
        for (let item of child) {
            let child = item.child_categories;
            getAllCategoryWithSubCat(item, result)
            delete item.child_categories;
        }
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brandList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandList = async (req, res) => {
    try {
        // Use the store_slug directly from query without parseInt, as it is a string
        let store_slug = req.query.store_slug ? req.query.store_slug : null;


        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }

        // Step 2: Find all products for the vendor
        const products = await Product.find({ product_owner: storeDetails.store_owner })
            .select('product_brand') // Select only the product_brand field
            .lean();
        if (products.length === 0) {
            let apiResponse = response.generate(1, 'No products found for this store owner', []);
            return res.status(404).send(apiResponse);
        }

        // Step 3: Extract unique brand IDs from the products
        const brandIds = [...new Set(products.map(product => product.product_brand))];
        if (brandIds.length === 0) {
            let apiResponse = response.generate(1, 'No brands associated with these products', []);
            return res.status(404).send(apiResponse);
        }

        // Step 4: Find all brands with the extracted IDs that are either 'active' or 'pending'
        const brands = await Brand.find({
            _id: { $in: brandIds },
            $or: [{ status: 'active' }, { status: 'pending' }]
        });
        if (brands.length === 0) {
            let apiResponse = response.generate(1, 'No brands found', []);
            return res.status(404).send(apiResponse);
        }

        // Success response with brands data
        let apiResponse = response.generate(0, 'Success', brands);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
}



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName homePageBrandList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let homePageBrandList = async (req, res) => {
    try {
        let record = await Brand.find({ status: 'active' }).lean().limit(15);
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
    * @functionName brand3dList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brand3dList = async (req, res) => {
    try {
        // Use the store_slug directly from query
        let store_slug = req.query.store_slug ? req.query.store_slug : null;


        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }

        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }
        let vendor_id = storeDetails.is_copy ? storeDetails.main_vendor_id : storeDetails.store_owner;
        // Step 2: Find all products for the vendor where product_3d_image.pro_3d_image is not empty
        const products = await Product.find({
            product_owner: vendor_id, product_category: contactCategory._id.toString(),
            'product_3d_image.pro_3d_image': { $ne: "" } // Ensure 3D image is not empty
        })
            .select('product_brand') // Select only the product_brand field
            .lean();

        // Step 3: Extract unique brand IDs from the products
        const brandIds = [...new Set(products.map(product => product.product_brand))];

        // Step 4: Find all brands with the extracted IDs that are either 'active' or 'pending'
        const brands = await Brand.find({
            _id: { $in: brandIds },status: 'active'
        });

        // Success response with brands data
        let apiResponse = response.generate(0, 'Success', brands);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
}




/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brand2dList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brand2dList = async (req, res) => {
    try {
        // Use the store_slug directly from query without parseInt, as it is a string
        let store_slug = req.query.store_slug ? req.query.store_slug : null;


        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        // Step 2: Find all products for the vendor where product_3d_image.pro_3d_image is blank
        const products = await Product.find({
            product_owner: storeDetails.store_owner, product_category: contactCategory._id.toString(),
            'product_3d_image.pro_3d_image': { $eq: '' } // Only select products with empty 3D image field
        })
            .select('product_brand') // Select only the product_brand field
            .lean();

        // Step 3: Extract unique brand IDs from the products
        const brandIds = [...new Set(products.map(product => product.product_brand))];

        // Step 4: Find all brands with the extracted IDs that are either 'active' or 'pending'
        const brands = await Brand.find({
            _id: { $in: brandIds },status: 'active'
        });

        // Success response with brands data
        let apiResponse = response.generate(0, 'Success', brands);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};





/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brand2d3dList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brand2d3dList = async (req, res) => {
    try {
        // Use the store_slug directly from query without parseInt, as it is a string
        let store_slug = req.query.store_slug ? req.query.store_slug : null;


        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug, status: 'active' }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }
        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'eyeglass' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Eyeglass data not found', []);
            return res.status(404).send(apiResponse);
        }

        // Step 2: Find all products for the vendor where product_3d_image.pro_3d_image is blank
        const products = await Product.find({
            product_owner: storeDetails.store_owner, product_category: contactCategory._id.toString()
        })
            .select('product_brand') // Select only the product_brand field
            .lean();

        // Step 3: Extract unique brand IDs from the products
        const brandIds = [...new Set(products.map(product => product.product_brand))];

        // Step 4: Find all brands with the extracted IDs that are either 'active' or 'pending'
        const brands = await Brand.find({
            _id: { $in: brandIds }, status: 'active'
        });

        // Success response with brands data
        let apiResponse = response.generate(0, 'Success', brands);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brandcontactList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandcontactList = async (req, res) => {
    try {
        // Use the store_slug directly from query without parseInt, as it is a string
        let store_slug = req.query.store_slug ? req.query.store_slug : null;


        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }

        let contactCategory = await Category.findOne({ status: 'active', category_slug: 'contact' }).lean();
        if (!contactCategory) {
            let apiResponse = response.generate(1, 'Contact data not found', []);
            return res.status(404).send(apiResponse);
        }
        // Step 2: Find all products for the vendor
        const products = await Product.find({ product_owner: storeDetails.store_owner, product_category: contactCategory._id.toString() })
            .select('product_brand') // Select only the product_brand field
            .lean();

        // Step 3: Extract unique brand IDs from the products
        const brandIds = [...new Set(products.map(product => product.product_brand))];

        // Step 4: Find all brands with the extracted IDs that are either 'active' or 'pending'
        const brands = await Brand.find({
            _id: { $in: brandIds},status: 'active'
        });

        // Success response with brands data
        let apiResponse = response.generate(0, 'Success', brands);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `Error: ${err.message}`, {});
        res.status(500).send(apiResponse);
    }
}


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName tagList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let tagList = async (req, res) => {
    try {
        let record = await Tag.find({ web_view_status: 'active', status: 'active' }).lean();
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
    * @functionName mediaTextContentList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let mediaTextContentList = async (req, res) => {
    try {
        // Use the store_slug directly from query without parseInt, as it is a string
        let store_slug = req.query.store_slug ? req.query.store_slug : null;

        // Check if store_slug is provided
        if (!store_slug) {
            let apiResponse = response.generate(1, 'store_slug is required', []);
            return res.status(400).send(apiResponse); // Return 400 Bad Request if store_slug is missing
        }

        // Step 1: Find store details based on the store_slug
        let storeDetails = await Store.findOne({ store_slug: store_slug }).sort({ position: 1 }).lean();
        if (!storeDetails) {
            let apiResponse = response.generate(1, 'Store not found', []);
            return res.status(404).send(apiResponse);
        }

        let vendoerquery = { status: 'active', web_view_status: 'active', vendor_id: mongoose.Types.ObjectId(storeDetails.store_owner) };
        // Fetch all matching data if no pagination is provided
        let vendorMediaList = await VendorMediaTextContentModel.find(vendoerquery).sort({ position: 1 }).lean();

        // Return data with total count from admin table
        let apiResponse = response.generate(0, `Success`, vendorMediaList);
        res.status(200).send(apiResponse);

    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};



module.exports = {
    storeList: storeList,
    configurationList: configurationList,
    product3dlist: product3dlist,
    roomconfigurationList: roomconfigurationList,
    storeViewCount: storeViewCount,
    vendorRoomCheck: vendorRoomCheck,
    storeDetails: storeDetails,
    vendorstoreDetails: vendorstoreDetails,
    product3dlistVendor: product3dlistVendor,
    product3dlistAllVendor: product3dlistAllVendor,
    product3dlistAllVendorForUser: product3dlistAllVendorForUser,
    product2dlistAllVendorForUser: product2dlistAllVendorForUser,
    categoryList: categoryList,
    eyeglascategoryList: eyeglascategoryList,
    brandList: brandList,
    homePageBrandList: homePageBrandList,
    brand3dList: brand3dList,
    brand2dList: brand2dList,
    brand2d3dList: brand2d3dList,
    brandcontactList: brandcontactList,
    tagList: tagList,
    mediaTextContainList: mediaTextContentList
}