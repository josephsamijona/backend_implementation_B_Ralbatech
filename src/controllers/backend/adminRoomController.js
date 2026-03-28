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
const Store = require('../../models/storeModel');
const Roomelement = require('../../models/roomElementModel');
const Roomsize = require('../../models/roomSizeModel');
const Department = require('../../models/departmentModel');
const Roomtexture = require('../../models/roomTextureMasterModel');
const Room = require('../../models/roomModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName roomSizeList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomSizeList = async (req, res) => {
    try {
        let roomSizeList = await Roomsize.find({ status: 'active' }).lean();
        let apiResponse = response.generate(0, ` Success`, roomSizeList);
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
    * @functionName   roomElementList
    * @functionPurpose
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomElementList = async (req, res) => {
    try {

        let record = await Roomelement.aggregate([{
            $unwind: "$roomelement_configaration"
        },
        {
            $lookup: {
                from: "roomsizes",
                let: {
                    roomelement_configaration: "$roomelement_configaration"
                },
                pipeline: [{
                    $match: {
                        $expr: { $eq: ["$_id", "$$roomelement_configaration.room_size"] }
                    }
                }],
                as: "roomelement_configaration.room_size"
            }
        },
        {
            $unwind: "$roomelement_configaration.room_size"
        },
        {
            $group: {
                _id: "$_id",
                roomelement_configaration: {
                    $push: "$roomelement_configaration"
                },
                data: {
                    $first: "$$ROOT"
                }
            }
        },
        {
            $addFields: {
                'data.roomelement_configaration': "$roomelement_configaration"
            }
        },
        {
            "$project": {
                "data.roomelement_configaration.room_size.status": 0,
                "data.roomelement_configaration.room_size.createdAt": 0,
                "data.roomelement_configaration.room_size.updatedAt": 0,
                "data.roomelement_configaration.room_size.__v": 0,

                "data.status": 0,
                "data.createdAt": 0,
                "data.updatedAt": 0,
                "data.__v": 0,

            }
        },
        {
            $replaceRoot: {
                newRoot: "$data"
            }
        }
        ]);

        let apiResponse = response.generate(0, ` Success`, record);
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
    * @functionName roomTextureList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomTextureList = async (req, res) => {
    try {
        let RoomtextureList = await Roomtexture.find({ status: 'active' }).lean();
        let apiResponse = response.generate(0, ` Success`, RoomtextureList);
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
    * @functionName createRoomtexture
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createRoomtexture = async (req, res) => {

    let newRoomTexture = {
        front: [{
            image: req.body.front[0].image,
            image_3d: req.body.front[0].image_3d,
            status: req.body.front[0].status,
        }],
        right: [{
            image: req.body.right[0].image,
            image_3d: req.body.right[0].image_3d,
            status: req.body.right[0].status,
        }],
        back: [{
            image: req.body.back[0].image,
            image_3d: req.body.back[0].image_3d,
            status: req.body.back[0].status,
        }],
        left: [{
            image: req.body.left[0].image,
            image_3d: req.body.left[0].image_3d,
            status: req.body.left[0].status,
        }],
        top: [{
            image: req.body.top[0].image,
            image_3d: req.body.top[0].image_3d,
            status: req.body.top[0].status,
        }],
        floor: [{
            image: req.body.floor[0].image,
            image_3d: req.body.floor[0].image_3d,
            status: req.body.floor[0].status,
        }],
    }
    await Roomtexture.findOneAndUpdate({ status: "active" }, { $push: { texture_images: newRoomTexture } }, { new: true });

    let apiResponse = response.generate(0, ` Success`, newRoomTexture);
    res.status(200);
    res.send(apiResponse);

}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName detailsRoomtexture
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let detailsRoomtexture = async (req, res) => {
    try {

        let roomtextureList = await Roomtexture.findOne({ 'texture_images._id': mongoose.Types.ObjectId(req.body.texture_id) });
        let apiResponse = response.generate(0, ` Success`, roomtextureList);
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
    * @functionName departmentList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentList = async (req, res) => {
    try {

        let storeList = await Store.find({}, { _id: 1 }).lean();

        let departmentList = await Department.find({ department_store: { $in: storeList }, "$or": [{ status: 'active' }, { status: 'inactive' }] }).populate('department_store', 'store_name status').lean();

        let results = await Promise.all(departmentList.map(async (eachObj) => {
            eachObj["department_room"] = await getRoomElementList(eachObj);
            return eachObj;
        }));

        let apiResponse = response.generate(0, ` Success`, results);
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
    * @functionName getRoomElementList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let getRoomElementList = async (req) => {
    try {

        let department_id = req.department_room
        let record = await Roomelement.aggregate([{
            $unwind: "$roomelement_configaration"
        },
        {
            $match: {
                "_id": mongoose.Types.ObjectId(department_id)
            }
        },
        {
            $lookup: {
                from: "roomsizes",
                let: {
                    roomelement_configaration: "$roomelement_configaration"
                },
                pipeline: [{
                    $match: {
                        $expr: { $eq: ["$_id", "$$roomelement_configaration.room_size"] }
                    }
                }],
                as: "roomelement_configaration.room_size"
            }
        },
        {
            $unwind: "$roomelement_configaration.room_size"
        },
        {
            $group: {
                _id: "$_id",
                roomelement_configaration: {
                    $push: "$roomelement_configaration"
                },
                data: {
                    $first: "$$ROOT"
                }
            }
        },
        {
            $addFields: {
                'data.roomelement_configaration': "$roomelement_configaration"
            }
        },
        {
            "$project": {
                "data.roomelement_configaration.room_size.status": 0,
                "data.roomelement_configaration.room_size.createdAt": 0,
                "data.roomelement_configaration.room_size.updatedAt": 0,
                "data.roomelement_configaration.room_size.__v": 0,

                "data.status": 0,
                "data.createdAt": 0,
                "data.updatedAt": 0,
                "data.__v": 0,

            }
        },
        {
            $replaceRoot: {
                newRoot: "$data"
            }
        }
        ]);

        if (record.length > 0) {
            return record[0];
        } else {
            return {};
        }

        let apiResponse = response.generate(0, ` Success`, record);
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
    * @functionName uploadDepartmentFiles
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadDepartmentFiles = async (req, res, next) => {
    let file = req.files;
    let fileUrl = {
        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key
    }

    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName departmentDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentDetails = async (req, res) => {
    try {

        let departmentList = await Department.findOne({ _id: mongoose.Types.ObjectId(req.body.department_id) }).populate('department_store', 'store_name status').lean();
        if (departmentList) {
            departmentList["department_room"] = await getRoomElementList(departmentList);
        }
        let apiResponse = response.generate(0, ` Success`, (departmentList) ? departmentList : {});
        res.status(200);
        res.send(apiResponse);
        rs
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
    * @functionName departmentUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentUpdate = async (req, res) => {

    try {
        let reqbody = req.body;
        let updatedDepartment = {};
        if (reqbody.status) {
            for (const property in reqbody) {
                updatedDepartment[property] = reqbody[property];
            }
        } else {
            updatedDepartment = {
                department_name: req.body.department_name,
                department_slug: genLib.createSlug(req.body.department_name),
                department_image: req.body.department_image,
                department_store: req.body.department_store,
                department_room: req.body.department_roomelement,
            }
        }


        await Department.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.department_id) }, updatedDepartment, { new: true });
        let apiResponse = response.generate(0, ` Success`, updatedDepartment);
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
    * @functionName departmentDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentDelete = async (req, res) => {
    try {
        let updateDepartment = {
            status: 'deleted'
        };
        await Department.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.department_id) }, updateDepartment, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateDepartment);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }


    try {
        let departmentList = await Department.findOne({ _id: mongoose.Types.ObjectId(req.body.department_id) }).populate('department_store', 'store_name status').lean();
        if (departmentList) {
            departmentList["department_room"] = await getRoomElementList(departmentList);
        }
        let apiResponse = response.generate(0, ` Success`, (departmentList) ? departmentList : {});
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
    * @functionName roomList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomList = async (req, res) => {
    try {

        let roomList = await Room.aggregate([{
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
                "texture": 0,
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




        }
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
    * @function async
    * @functionName updateRoom
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let updateRoom = async (req, res) => {
    try {
        let updatedRoom = {}
        if (req.body.status) {
            updatedRoom = {
                status: req.body.status
            }
        } else {
            updatedRoom = {
                room_name: req.body.room_name,

                department: {
                    _id: req.body.department_id
                },
                roomelement: {
                    _id: req.body.roomelement_id
                },
                roomesize: {
                    _id: req.body.roomsize, // Small, Large
                },
                roomcount: req.body.roomcount,
                texture: {
                    front: {
                        _id: mongoose.Types.ObjectId(req.body.texture.front_image_id),
                    },
                    right: {
                        _id: mongoose.Types.ObjectId(req.body.texture.right_image_id),
                    },
                    back: {
                        _id: mongoose.Types.ObjectId(req.body.texture.back_image_id),
                    },
                    left: {
                        _id: mongoose.Types.ObjectId(req.body.texture.left_image_id),
                    },
                    top: {
                        _id: mongoose.Types.ObjectId(req.body.texture.top_image_id),
                    },
                    floor: {
                        _id: mongoose.Types.ObjectId(req.body.texture.floor_image_id),
                    }
                }
            };
        }
        await Room.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.room_id), vendor: mongoose.Types.ObjectId(req.body.vendor_id) }, updatedRoom, { new: true });

        let apiResponse = response.generate(0, ` Success`, updatedRoom);
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
    * @functionName roomDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomDetails = async (req, res) => {
    try {

        let roomList = await Room.aggregate([{
            $match: {
                $and: [
                    { _id: mongoose.Types.ObjectId(req.body.room_id) }
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

        let texture_list = await Roomtexture.find({ 'texture_images.0.front.0._id': roomList[0].texture[0].front._id }).lean();

        if (roomList.length > 0) {

            let results = await Promise.all(roomList[0].texture.map(async (eachObj) => {

                eachObj["front"] = await textureDetails(eachObj.front._id, 'front', texture_list);
                eachObj["right"] = await textureDetails(eachObj.right._id, 'right', texture_list);
                eachObj["back"] = await textureDetails(eachObj.back._id, 'back', texture_list);
                eachObj["left"] = await textureDetails(eachObj.left._id, 'left', texture_list);
                eachObj["top"] = await textureDetails(eachObj.top._id, 'top', texture_list);
                eachObj["floor"] = await textureDetails(eachObj.floor._id, 'floor', texture_list);
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
    * @function async
    * @functionName roomDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomDelete = async (req, res) => {
    try {
        let updateRoom = {
            status: 'deleted'
        };
        await Room.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.room_id) }, updateRoom, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateRoom);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }


    try {
        let updatedRoom = {}

        updatedRoom = {
            status: 'deleted'
        }

        await Room.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.room_id), vendor: mongoose.Types.ObjectId(req.body.vendor_id) }, updatedRoom, { new: true });

        let apiResponse = response.generate(0, ` Success`, updatedRoom);
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
    * @functionName textureDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let textureDetails = async (ordinate, orval, texture_list) => {
    try {

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
    * @function async
    * @functionName uploadRoomTextureFiles
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadRoomTextureFiles = async (req, res) => {
    let file = req.files;
    let fileUrl = {
        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key
    }

    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName updateRoomtexture
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let updateRoomtexture = async (req, res) => {

    try {

        let front = [{
            image: req.body.front[0].image,
            image_3d: req.body.front[0].image_3d,
            status: req.body.front[0].status,
            _id: mongoose.Types.ObjectId(req.body.front[0]._id)
        }];

        let right = [{
            image: req.body.right[0].image,
            image_3d: req.body.right[0].image_3d,
            status: req.body.right[0].status,
            _id: mongoose.Types.ObjectId(req.body.right[0]._id)
        }];

        let back = [{
            image: req.body.back[0].image,
            image_3d: req.body.back[0].image_3d,
            status: req.body.back[0].status,
            _id: mongoose.Types.ObjectId(req.body.back[0]._id)
        }];

        let left = [{
            image: req.body.left[0].image,
            image_3d: req.body.left[0].image_3d,
            status: req.body.left[0].status,
            _id: mongoose.Types.ObjectId(req.body.left[0]._id)
        }];

        let top = [{
            image: req.body.top[0].image,
            image_3d: req.body.top[0].image_3d,
            status: req.body.top[0].status,
            _id: mongoose.Types.ObjectId(req.body.top[0]._id)
        }];
        let floor = [{
            image: req.body.floor[0].image,
            image_3d: req.body.floor[0].image_3d,
            status: req.body.floor[0].status,
            _id: mongoose.Types.ObjectId(req.body.floor[0]._id)
        }];

        let tDATA = await Roomtexture.updateOne({ 'texture_images._id': mongoose.Types.ObjectId(req.body.texture_id) }, {
            '$set': {
                'texture_images.$.front': front,
                'texture_images.$.right': right,
                'texture_images.$.back': back,
                'texture_images.$.left': left,
                'texture_images.$.top': top,
                'texture_images.$.floor': floor
            }
        });
        let apiResponse = response.generate(0, ` Success`, tDATA);
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
    * @functionName deleteRoomtexture
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let deleteRoomtexture = async (req, res) => {
    try {
        let updateTexture = {
            status: 'deleted'
        };
        await Roomtexture.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.texture_id) }, updateTexture, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateTexture);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


module.exports = {

    roomSizeList: roomSizeList,
    roomElementList: roomElementList,
    uploadRoomTextureFiles: uploadRoomTextureFiles,
    roomTextureList: roomTextureList,
    createRoomtexture: createRoomtexture,
    detailsRoomtexture: detailsRoomtexture,
    updateRoomtexture: updateRoomtexture,
    deleteRoomtexture: deleteRoomtexture,
    departmentList: departmentList,
    uploadDepartmentFiles: uploadDepartmentFiles,
    departmentDetails: departmentDetails,
    departmentUpdate: departmentUpdate,
    departmentDelete: departmentDelete,
    roomList: roomList,
    updateRoom: updateRoom,
    roomDetails: roomDetails,
    roomDelete: roomDelete
}