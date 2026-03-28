/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Friday 9 Aug 2021 12∶18∶31 PM
 * last Update : Friday 29 July 2022 04∶18∶31 PM
 * Note:  Vendor store control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
const sendemail = require("../../libs/sendmail");
const { v4: uuidv4 } = require('uuid');
// Import Model
const Product = require('../../models/productModel');
const Store = require('../../models/storeModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const Vendor = require('../../models/vendorModel');
const Department = require('../../models/departmentModel');
const MasterModule = require('../../models/masterModules');
const Room = require('../../models/roomModel');
const Imagedelete = require('../../middlewares/fileDelete');
const SubAdminModule = require('../../models/subAminModules');
const checkLib = require("../../libs/checkLib");
const JWT = require('../../libs/tokenLib');
const MediaTextContentModel = require('../../models/mediaTextContentModel');
const VendorMediaTextContentModel = require('../../models/vendorMediaTextContentModel');

/**
 * @author Ankush Shome
 * @param {*} req 
 * @param {*} res 
 */
let uploadFiles = async (req, res) => {
    let file = req.files;
    let fileUrl = {
        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key,
        image_name: file['image'][0].key
    }
    //console.log(fileUrl);
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
 * create store for 3D Room
 * POST
  @param {*} req // need store details
  @param {*} res // show status with upload data
 */

let storeCreate = async (req, res) => {
    try {
        if (req.body.is_logo) {
            if (!(req.body.logo || req.body.logo_name)) {
                throw new Error('Store Logo OR Name Required');
            }
        }

        // Check if is_copy is true and main_vendor_id is provided
        let copiedStoreDetails;
        let token
        let storeslug_final = '';
        if (req.body.is_copy && req.body.main_vendor_id) {
            // Fetch the store details of the main vendor
            copiedStoreDetails = await Store.findOne({ store_owner: mongoose.Types.ObjectId(req.body.main_vendor_id), status: 'active' }).lean();
            if (!copiedStoreDetails) {
                throw new Error('Main vendor store not found');
            }
            // Prepare to copy the store data except store_name and logo if provided
            copiedStoreDetails.is_copy = true;
            copiedStoreDetails.main_vendor_id = copiedStoreDetails.store_owner;
            copiedStoreDetails.store_owner = req.user.vendor_id; // Assign the new store owner
            copiedStoreDetails.main_store_id = copiedStoreDetails._id;
            let storeslug = genLib.createSlug(req.body.store_name || copiedStoreDetails.store_name);
            let count_find_store = await Store.countDocuments({ "store_slug": { $regex: '.*' + storeslug + '.*' } })
            storeslug_final = (count_find_store > 0) ? storeslug + '-' + (count_find_store + 1) : storeslug;
            copiedStoreDetails.store_slug = storeslug_final;
            copiedStoreDetails.is_logo = req.body.is_logo;
            // Remove unnecessary fields
            delete copiedStoreDetails._id;
            delete copiedStoreDetails.createdAt;
            delete copiedStoreDetails.updatedAt;
            delete copiedStoreDetails.__v;

            // Overwrite store_name and logo if provided by the vendor
            if (req.body.store_name != "") {
                copiedStoreDetails.store_name = req.body.store_name;
            }
            if (req.body.logo != "") {
                copiedStoreDetails.is_logo = req.body.is_logo,
                    copiedStoreDetails.logo = req.body.logo;
                copiedStoreDetails.logo_name = req.body.logo_name;
                copiedStoreDetails.logo_file_name = req.body.logo_file_name;
            }
            if (req.body.domain_name != "") {
                copiedStoreDetails.domain_name = req.body.domain_name;
            }

            let vendorObj =
            {
                is_copy: req.body.is_copy ? req.body.is_copy : false,
                main_vendor_id: req.body.main_vendor_id,
                vendor_type: req.body.is_copy ? 'access' : 'main',
            }

            let vendorDeatils = await Vendor.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.user.vendor_id) }, vendorObj, { new: true });

            let tokenObj =
            {
                vendor_id: req.user.vendor_id,
                name: vendorDeatils.name,
                email: vendorDeatils.email.toLowerCase(),
                phone: vendorDeatils.phone,
                role: { role_name: 'vendor' },
                vendor_type: vendorDeatils.vendor_type,
                is_copy: req.body.is_copy,
                main_vendor_id: req.body.main_vendor_id,
                vendor_type: 'access',
                profile_image: vendorDeatils.vendor_image
            }

            token = await JWT.generateToken(tokenObj);
        }

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

        let count_store = await Store.countDocuments({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.user.vendor_id });

        let admin_emails = alladmins.map((elem) => {
            return elem.subadmin['email'];
        });
        if (!req.body.is_copy) {
            let storeslug = genLib.createSlug(req.body.store_name);
            let count_find_store = await Store.countDocuments({ "store_slug": { $regex: '.*' + storeslug + '.*' } })
            storeslug_final = (count_find_store > 0) ? storeslug + '-' + (count_find_store + 1) : storeslug;
        }


        let finalStoreDetails = copiedStoreDetails || {
            store_name: req.body.store_name,
            store_slug: storeslug_final,
            store_location: req.body.store_location,
            domain_name: req.body.domain_name,
            store_owner: {
                _id: req.user.vendor_id
            },
            store_description: req.body.store_description,
            store_jpg_file: req.body.store_jpg_file,
            store_jpg_file_name: req.body.store_jpg_file_name,
            store_glb_file: req.body.store_glb_file,
            store_glb_file_name: req.body.store_glb_file_name,
            store_json_file_name: req.body.store_json_file_name,
            store_products: req.body.store_products,
            is_logo: req.body.is_logo,
            logo_name: req.body.logo_name,
            logo: req.body.logo,
            logo_file_name: req.body.logo_file_name,
            status: 'pending'
        };

        if (count_store < 1) {
            let newStore = new Store(finalStoreDetails);
            // console.log('newStore ===', finalStoreDetails);
            await newStore.save();


            // let adminMediaList = await MediaTextContentModel.find({ status: 'active' }).lean();
            // for (let item of adminMediaList) {
            //     item.media_text_contain_id = mongoose.Types.ObjectId(item._id),
            //         item.vendor_id = mongoose.Types.ObjectId(req.user.vendor_id),
            //         item.web_view_status = 'active',
            //         delete item._id
            //     let newVendorMediaTextContent = new VendorMediaTextContentModel(item);
            //     await newVendorMediaTextContent.save();
            // }

            // let adminMediaList = await MediaTextContentModel.find({ status: 'active' }).lean();
            let existingVendorMedia = await VendorMediaTextContentModel.find({
                vendor_id: mongoose.Types.ObjectId(req.body.main_vendor_id), status: 'active'
            }).lean();
            for (let item of existingVendorMedia) {
                item.vendor_id = mongoose.Types.ObjectId(req.user.vendor_id);
                delete item._id;
                delete item.createdAt;
                delete item.updatedAt;
                delete item.__v;
                let newVendorMediaTextContent = new VendorMediaTextContentModel(item);
                await newVendorMediaTextContent.save();
            }

            // Sending email notifications (omitted for brevity)
            let vendorrecord = await Vendor.findOne({ _id: mongoose.Types.ObjectId(req.user.vendor_id) }).lean();

            let VendorProposal = {
                "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I want to Request A store Front Proposal</p><br/><p>Vendor Proposal Details: </p><p>${req.body.store_description}</p><br/><p>Vendor Details: </p><p>name: ${vendorrecord['name']} </p><p>email: ${vendorrecord['email']} </p><p>phone: ${vendorrecord['phone']} </p><br/><p> I have new STORE Created. Plaese APPROVE  my store.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/list-vendor-store/${req.user.vendor_id}'>Click here</a><br/> Store URL : <p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
                "subject": `Ralba Technologies : Request A store Front Proposal and New Store`

            }
            let rquestProposal = {
                "template": "<h3>Hi!</h3><br/><p>Thank you for sending a store proposal. We will process your request.Ralba will reach out to you via email with a proposal</p><br/><p>Your Proposal Details: </p><p>" + req.body.store_description + "</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>",
                "receiver_mail": [`${vendorrecord['email']}`],
                "subject": `Ralba Technologies : Request A store Front Proposal`

            }
            let allSubadminAdmin = {
                "template": `<h3>Hi!</h3><br/><p>Thank you for Creating  your store.</p><p>Here is your Store URL: https://ralbatech.com/vendor/${storeslug_final}</p><br/><br/><a href="https://ralbatech.com/vendor/${storeslug_final}" taget="_blank">Click Here to Visit Store Home Page</a> <p>NOTE : Make sure before opening this link you need to add banner. To add banner click here . <a href="https://admin.ralbatech.com/vendor-banner/add-vendor-banner" target="_blank">click here</a> .</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [`${vendorrecord['email']}`],
                "subject": `Ralba Technologies : Store Home Page `

            }
            sendemail.sendMailFunc(allSubadminAdmin);

            let freshStore = {
                "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have new STORE Created. Plaese APPROVE  my store.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/list-vendor-store/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
                "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
                "subject": `Ralba Technologies : New STORE Created`

            }

            if (!checkLib.isEmpty(req.body.store_description)) {
                sendemail.sendMailFunc(VendorProposal);
                sendemail.sendMailFunc(rquestProposal);
            }
            else {
                sendemail.sendMailFunc(freshStore);
            }

            let apiResponse = response.generate(0, 'Success', { newStore, token });
            res.status(200).send(apiResponse);
        } else {
            let apiResponse = response.generate(0, `You can't add more than one store.`, {});
            res.status(410).send(apiResponse);
        }

    } catch (e) {
        let apiResponse = response.generate(0, e.message, {});
        res.status(410).send(apiResponse);
    }
}

/**
 * @author Ankush Shome
 * Show list store for 3D Room
 * POST
  @param {*} req // need pagination details
  @param {*} res // show store list
 */

let storeList = async (req, res) => {
    let skip = 0;
    let limit = parseInt(req.body.limit);
    if (req.body.page > 1) {
        skip = req.body.page - 1 * limit;
    }
    try {
        let record = await Store.find({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.user.vendor_id }, null, { skip: skip, limit: limit }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
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
 * @author Ankush Shome
 * Show store details
 * POST
  @param {*} req // need store id
  @param {*} res // show store details
 */

let storeDetails = async (req, res) => {
    try {
        let record = await Store.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], store_owner: req.user.vendor_id, _id: mongoose.Types.ObjectId(req.body.store_id) }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
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
    * @author Ankush Shome
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName storeUpdate
    * @functionPurpose  store update controller
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let storeUpdate = async (req, res) => {
    try {
        console.log('Store req user ===', req.user);

        if (req.user.vendor_type != 'access') {
            let updatedaccessStore = {
                status: 'pending'
            };
            let vout = await Store.updateMany({ main_store_id: req.body.store_id }, updatedaccessStore, { new: true });
        }
        if (req.body.is_logo) {
            if (checkLib.isEmpty(req.body.logo_name) && checkLib.isEmpty(req.body.logo)) {
                throw new Error('Store Logo OR Name Required');
            }
        }
        let reqbody = req.body;

        let storeslug_final = '';
        let storeslug = genLib.createSlug(req.body.store_name);
        let count_find_store = await Store.countDocuments({ "store_slug": { $regex: '.*' + storeslug + '.*' } })
        let storedetail = await Store.find({ _id: mongoose.Types.ObjectId(req.body.store_id) }).lean();
        if (storedetail[0].store_name == req.body.store_name) {
            storeslug_final = storedetail[0].store_slug
        } else {
            storeslug_final = (count_find_store > 0) ? storeslug + '-' + (count_find_store + 1) : storeslug
        }

        let updatedStore = {
            store_slug: storeslug_final,
            store_location: req.body.store_location,
            domain_name: req.body.domain_name,
            store_products: req.body.store_products,
            status: 'pending'
        };
        for (const property in reqbody) {
            updatedStore[property] = reqbody[property];
        }
        //console.log('Store Update View ===', updatedStore);

        await Store.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.store_id), store_owner: mongoose.Types.ObjectId(req.user.vendor_id) }, updatedStore, { new: true });

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

        let vendorrecord = await Vendor.findOne({ _id: mongoose.Types.ObjectId(req.user.vendor_id) }).lean();

        let option = {
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have update STORE . Plaese APPROVE  my store.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/list-vendor-store/${req.user.vendor_id}'>Click here</a> <br/><br/> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : Update STORE`

        }
        sendemail.sendMailFunc(option);

        let option3 = {
            "template": `<h3>Hi!</h3><br/><p>Thank you for Updating  your store.</p><p>Here is your Store URL: https://ralbatech.com/vendor/${storeslug_final} </p><br/> <br/><a href="https://ralbatech.com/vendor/${storeslug_final}" taget="_blank">Click Here to Visit Store Home Page</a> <p>NOTE : Make sure before opening this link you need to add banner. To add banner click here . <a href="https://admin.ralbatech.com/vendor-banner/add-vendor-banner" target="_blank">click here</a> .</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${vendorrecord['email']}`],
            "subject": `Ralba Technologies : Store Home Page `

        }
        sendemail.sendMailFunc(option3);

        let apiResponse = response.generate(0, ` Success`, updatedStore);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        //console.log(err);
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

/**
 * Selete store
 * POST
  @param {*} req // need store id
  @param {*} res // show status
 */

let storeDelete = async (req, res) => {
    try {
        let updateStore = {
            status: 'deleted'
        };

        await Store.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.store_id), store_owner: mongoose.Types.ObjectId(req.user.vendor_id) }, updateStore, { new: true });
        await Product.updateMany({ product_owner: mongoose.Types.ObjectId(req.user.vendor_id) }, updateStore, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateStore);
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
 * store delete
 * POST
  @param {*} req // need store id
  @param {*} res // show status
 */
let storeImageDelete = async (req, res) => {
    try {
        let deletestatus = await Imagedelete.storeDelete(req.body.image_name)


        let updatedStore = {
            store_image: '',
            store_image_name: ''
        };

        let sdata = await Store.findOneAndUpdate({ store_owner: mongoose.Types.ObjectId(req.user.vendor_id), store_image_name: req.body.image_name }, updatedStore, { new: true });

        let apiResponse = response.generate(0, ` Success`, deletestatus);
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
 * store product update
 * POST
  @param {*} req // need store id
  @param {*} res // show status
 */
let storeProductUpdate = async (req, res) => {
    try {
        let record = await Store.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], store_slug: req.body.store_slug }).populate('store_owner', 'name status').populate('store_department', 'department_name department_image status').lean();
        const foundObject = record.store_products[req.body.store_no].findIndex(obj => JSON.stringify(obj.product_codination) === JSON.stringify(req.body.product_codination));
        record.store_products[req.body.store_no][foundObject].product_sku = req.body.product_sku;
        let sdata = await Store.findOneAndUpdate({ "$or": [{ status: 'active' }, { status: 'pending' }], store_slug: req.body.store_slug }, record, { new: true });
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
 * store Duplicate
 * POST
  @param {*} req // need store id
  @param {*} res // show status
 */
let storeDuplicate = async (req, res) => {
    try {
        let record = await Store.findOne({ "$or": [{ status: 'active' }, { status: 'pending' }], store_slug: req.body.store_slug }).lean();
        let shadowRecord = JSON.parse(JSON.stringify(record));
        const copyObject = shadowRecord.store_products[0].map((elem) => {
            elem.product_sku = ''
            return elem
        })
        record.store_products.push(copyObject);
        let sdata = await Store.findOneAndUpdate({ "$or": [{ status: 'active' }, { status: 'pending' }], store_slug: req.body.store_slug }, record, { new: true });
        let apiResponse = response.generate(0, ` Success`, sdata);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

module.exports = {
    storeCreate: storeCreate,
    storeList: storeList,
    uploadFiles: uploadFiles,
    storeDetails: storeDetails,
    storeUpdate: storeUpdate,
    storeDelete: storeDelete,
    storeImageDelete: storeImageDelete,
    storeProductUpdate: storeProductUpdate,
    storeDuplicate: storeDuplicate,
}