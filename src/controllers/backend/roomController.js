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
const MasterModule = require('../../models/masterModules');
const Room = require('../../models/roomModel');
const sendemail = require("../../libs/sendmail");
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const Product = require('../../models/productModel');
const { v4: uuidv4 } = require('uuid');
const Imagedelete = require('../../middlewares/fileDelete');
const Admin = require('../../models/adminModel');
const SubAdminModule = require('../../models/subAminModules');



/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName createRoomSize
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createRoomSize = async (req, res) => {
    let newRoomSize = new Roomsize({
        roomsize_name: req.body.roomsize_name,
    });
    await newRoomSize.save((err, newRoomSize) => {
        //console.log('success');
        let apiResponse = response.generate(0, ` Success`, newRoomSize);
        res.status(200);
        res.send(apiResponse);
    });
}

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName createRoomElement
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createRoomElement = async (req, res) => {
    let newRoomElement = new Roomelement({
        roomelement_name: req.body.roomelement_name,

        roomelement_configaration: req.body.roomelement_configaration
    });
    await newRoomElement.save((err, newRoomElement) => {
        //console.log('success');
        let apiResponse = response.generate(0, ` Success`, newRoomElement);
        res.status(200);
        res.send(apiResponse);
    });
}

/**
    * @author Ankush Shome
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
    * @author Ankush Shome
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

        let storeList = await Store.find({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.user.vendor_id }, { _id: 1 }).lean();

        let departmentList = await Department.find({ "$or": [{ status: 'active' }, { status: 'pending' }], department_store: { $in: storeList } }).populate('department_store', 'store_name status').lean();
        let results = await Promise.all(departmentList.map(async (eachObj) => {
            eachObj["department_room"] = await getRoomElementList(eachObj);

            eachObj["total_product"] = await Product.countDocuments({ "$or": [{ status: 'active' }, { status: 'pending' }], product_owner: mongoose.Types.ObjectId(req.user.vendor_id), product_department: mongoose.Types.ObjectId(eachObj._id) });
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
    * @author Ankush Shome
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
let getRoomElementList = async (req, res) => {
    try {
        //console.log(req.department_room);
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName roomElementList
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

        let department_id = req.department_room
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
    * @author Ankush Shome
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
    let newRoomTexture = new Roomtexture({
        texture_images: {
            front: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
            right: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
            back: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
            left: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
            top: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
            floor: [{
                image: "https://image.shutterstock.com/image-illustration/empty-room-painted-wall-white-260nw-1709458624.jpg",
                status: "Active",
            }],
        }
    });

    await newRoomTexture.save((err, newRoomTexture) => {

        let apiResponse = response.generate(0, ` Success`, newRoomTexture);
        res.status(200);
        res.send(apiResponse);
    });

}

/**
    * @author Ankush Shome
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName createRoom
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createRoom = async (req, res) => {
    try {

        let checkroom = await Room.find({
            status: 'active',
            department: mongoose.Types.ObjectId(req.body.department_id),
            vendor: mongoose.Types.ObjectId(req.user.vendor_id)
        });

        if (checkroom.length == 0) {

            let newRoom = new Room({
                room_name: req.body.room_name,
                vendor: {
                    _id: req.user.vendor_id
                },
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
                },
                status: 'pending'
            });

            await newRoom.save((err, newRoom) => {

                let apiResponse = response.generate(0, ` Success`, newRoom);
                res.status(200);
                res.send(apiResponse);
            });
            let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();

            let alladmins = await SubAdminModule.aggregate([{
                $match: {
                    $and: [
                        { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
                    ]
                }
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "subadmin_id",
                    foreignField: "_id",
                    as: "subadmin",
                }
            },
            {
                $unwind: "$subadmin"
            },
            {
                "$project": {
                    "_id": 1,
                    "module_id": 1,
                    "subadmin_id": 1,
                    "subadmin._id": 1,
                    "subadmin.email": 1,
                    "subadmin.role": 1,
                }
            }
            ]);


            let admin_emails = alladmins.map((elem) => {
                return elem.subadmin['email'];
            })

            let option = {
                "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have new ROOM Created. Plaese APPROVE  my room.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-list-room/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
                "subject": `Ralba Technologies : New ROOM Created`

            }
            sendemail.sendMailFunc(option);

        } else {
            let apiResponse = response.generate(1, ` Room already exists under this department for this vendor.`, {});
            res.status(410);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
    * @author Ankush Shome
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
            $match: {
                $and: [
                    { "$or": [{ status: 'active' }, { status: 'pending' }], },
                    { vendor: mongoose.Types.ObjectId(req.user.vendor_id) }
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
    * @author Ankush Shome
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
                    { "$or": [{ status: 'active' }, { status: 'pending' }] },
                    { vendor: mongoose.Types.ObjectId(req.user.vendor_id) },
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
                //"texture":0,
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


        let texture_list = await Roomtexture.find({ 'texture_images.$.front.0._id': roomList[0].texture[0].front._id }).lean();

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


            let apiResponse = response.generate(0, ` Success`, roomList);
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
    * @functionName roomAvailablity
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let roomAvailablity = async (req, res) => {
    try {
        //let roomList = await Room.find({$and : [{status: 'active'},{vendor: req.user.vendor_id}]}).lean();
        let roomList = await Room.aggregate([{
            $match: {
                $and: [
                    { "$or": [{ status: 'active' }, { status: 'pending' }] },
                    { vendor: mongoose.Types.ObjectId(req.user.vendor_id) },
                    { department: mongoose.Types.ObjectId(req.body.department_id) }
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
                //"texture":0,
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
    * @author Ankush Shome
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
    * @author Ankush Shome
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
        let updatedRoom = {
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
            },
            status: 'pending'
        };
        await Room.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.room_id), vendor: mongoose.Types.ObjectId(req.user.vendor_id) }, updatedRoom, { new: true });

        let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();

        let alladmins = await SubAdminModule.aggregate([{
            $match: {
                $and: [
                    { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
                ]
            }
        },
        {
            $lookup: {
                from: "admins",
                localField: "subadmin_id",
                foreignField: "_id",
                as: "subadmin",
            }
        },
        {
            $unwind: "$subadmin"
        },
        {
            "$project": {
                "_id": 1,
                "module_id": 1,
                "subadmin_id": 1,
                "subadmin._id": 1,
                "subadmin.email": 1,
                "subadmin.role": 1,
            }
        }
        ]);


        let admin_emails = alladmins.map((elem) => {
            return elem.subadmin['email'];
        })

        let option = {
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have update ROOM . Plaese APPROVE  my room.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-list-room/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : Update ROOM`

        }
        sendemail.sendMailFunc(option);

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
    * @functionName deleteRoom
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let deleteRoom = async (req, res) => {
    try {
        let deleteroom = {
            status: 'deleted'
        };
        let record = await Room.findOne({ _id: mongoose.Types.ObjectId(req.body.room_id), vendor: mongoose.Types.ObjectId(req.user.vendor_id) });

        await Product.updateMany({ product_department: mongoose.Types.ObjectId(record.department) }, deleteroom, { new: true });
        await Room.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.room_id), vendor: mongoose.Types.ObjectId(req.user.vendor_id) }, deleteroom, { new: true });
        let apiResponse = response.generate(0, ` Success`, deleteroom);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName departmentCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentCreate = async (req, res) => {


    let departmentslug = genLib.createSlug(req.body.department_name);
    let count_find_department = await Department.countDocuments({ "department_slug": { $regex: '.*' + departmentslug + '.*' } })

    let newDepartment = new Department({
        department_name: req.body.department_name,
        department_slug: departmentslug + '-' + (count_find_department + 1),
        department_image: req.body.department_image,
        department_image_name: req.body.department_image_name,
        department_store: {
            _id: req.body.department_store
        },
        department_room: req.body.department_roomelement,
        status: 'pending'
    });
    let departmentData = await newDepartment.save((err, newDepartment) => {

    });

    let newDept = {
        _id: newDepartment._id
    };
    await Store.findOneAndUpdate({ "_id": mongoose.Types.ObjectId(req.body.department_store) }, { $push: { store_department: newDept } }, { new: true });

    let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();

    let alladmins = await SubAdminModule.aggregate([{
        $match: {
            $and: [
                { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
            ]
        }
    },
    {
        $lookup: {
            from: "admins",
            localField: "subadmin_id",
            foreignField: "_id",
            as: "subadmin",
        }
    },
    {
        $unwind: "$subadmin"
    },
    {
        "$project": {
            "_id": 1,
            "module_id": 1,
            "subadmin_id": 1,
            "subadmin._id": 1,
            "subadmin.email": 1,
            "subadmin.role": 1,
        }
    }
    ]);


    let admin_emails = alladmins.map((elem) => {
        return elem.subadmin['email'];
    })

    let option = {
        "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have new DEPARTMENT Created. Plaese APPROVE  my department.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-department-list/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
        "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
        "subject": `Ralba Technologies : New DEPARTMENT Created`

    }
    sendemail.sendMailFunc(option);

    let apiResponse = response.generate(0, ` Success`, departmentData);
    res.status(200);
    res.send(apiResponse);
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


        let departmentslug_final = '';
        let departmentslug = genLib.createSlug(req.body.department_name);
        let count_find_department = await Department.countDocuments({ "department_slug": { $regex: '.*' + departmentslug + '.*' } })
        let deptdetail = await Department.find({ _id: mongoose.Types.ObjectId(req.body.department_id) }).lean();
        if (deptdetail[0].department_name == req.body.department_name) {
            departmentslug_final = deptdetail[0].department_slug
        } else {
            departmentslug_final = departmentslug + '-' + (count_find_department + 1)
        }

        let updatedDepartment = {
            department_name: req.body.department_name,
            department_image: req.body.department_image,
            department_image_name: req.body.department_image_name,
            department_slug: departmentslug_final,
            department_store: {
                _id: req.body.department_store
            },
            department_room: req.body.department_roomelement,
            status: 'pending'
        }

        let updatedRoom = {
            roomelement: {
                _id: req.body.department_roomelement
            }

        };
        await Room.findOneAndUpdate({ department: mongoose.Types.ObjectId(req.body.department_id) }, updatedRoom, { new: true });
        let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();
        let alladmins = await SubAdminModule.aggregate([{
            $match: {
                $and: [
                    { module_id: mongoose.Types.ObjectId(vendorModule._id), status: 'active' }
                ]
            }
        },
        {
            $lookup: {
                from: "admins",
                localField: "subadmin_id",
                foreignField: "_id",
                as: "subadmin",
            }
        },
        {
            $unwind: "$subadmin"
        },
        {
            "$project": {
                "_id": 1,
                "module_id": 1,
                "subadmin_id": 1,
                "subadmin._id": 1,
                "subadmin.email": 1,
                "subadmin.role": 1,
            }
        }
        ]);


        let admin_emails = alladmins.map((elem) => {
            return elem.subadmin['email'];
        })
        let option = {
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have update DEPARTMENT . Plaese APPROVE  my department.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-department-list/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : Update DEPARTMENT`
        }
        sendemail.sendMailFunc(option);

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
    * @author Ankush Shome
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
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key,
        image_name: file['image'][0].key
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

        let departmentList = await Department.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], _id: mongoose.Types.ObjectId(req.body.department_id) }).populate('department_store', 'store_name status').lean();
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
    * @author Ankush Shome
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
        await Room.findOneAndUpdate({ department: mongoose.Types.ObjectId(req.body.department_id) }, updateDepartment, { new: true });
        await Product.updateMany({ product_department: mongoose.Types.ObjectId(req.body.department_id) }, updateDepartment, { new: true })
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

        let departmentList = await Department.findOne({ status: 'active', _id: mongoose.Types.ObjectId(req.body.department_id) }).populate('department_store', 'store_name status').lean();
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
    * @functionName departmentImageDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let departmentImageDelete = async (req, res) => {

    try {

        let deletestatus = await Imagedelete.departmentDelete(req.body.department_image_name)

        let updatedDepartment = {
            department_image_name: '',
            department_image: ''
        }
        await Department.findOneAndUpdate({ department_image_name: req.body.department_image_name }, updatedDepartment, { new: true });

        let apiResponse = response.generate(0, ` Success`, deletestatus);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

module.exports = {
    createRoomElement: createRoomElement,
    createRoomSize: createRoomSize,
    roomSizeList: roomSizeList,
    departmentList: departmentList,
    roomElementList: roomElementList,
    createRoomtexture: createRoomtexture,
    roomTextureList: roomTextureList,
    createRoom: createRoom,
    roomList: roomList,
    roomDetails: roomDetails,
    roomAvailablity: roomAvailablity,
    updateRoom: updateRoom,
    deleteRoom: deleteRoom,
    textureDetails: textureDetails,
    departmentCreate: departmentCreate,
    uploadDepartmentFiles: uploadDepartmentFiles,
    departmentDetails: departmentDetails,
    departmentUpdate: departmentUpdate,
    departmentDelete: departmentDelete,
    departmentImageDelete: departmentImageDelete
}