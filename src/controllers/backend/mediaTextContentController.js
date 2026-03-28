/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Monday 13 Jan 2025 12∶18∶31 PM
 * last Update : Monday 13 Jan 2025 12∶18∶31 PM
 * Note:  Media Text control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
// Import Model
const MediaTextContentModel = require('../../models/mediaTextContentModel');
const VendorMediaTextContentModel = require('../../models/vendorMediaTextContentModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const checkLib = require("../../libs/checkLib");
const Tag = require("../../models/tagModel");

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created  13/1/2025
    * @Date_Modified  13/1/2025
    * @function async
    * @functionName mediaTextContentList
    * @functionPurpose  show list of Media Text Content List
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let mediaTextContentList = async (req, res) => {
    // Default values for pagination
    let page = req.query.page ? parseInt(req.query.page) : null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        let vendor_id;
        // if (req.user.vendor_type == 'access' && req.user.is_copy) {
        //     vendor_id = req.user.main_vendor_id;
        // } else {
        //     vendor_id = req.user.vendor_id;
        // }
        vendor_id = req.user.vendor_id;

        // Step 1: Fetch all active media content from MediaTextContentModel
        let adminMediaList = await MediaTextContentModel.find({ status: 'active' }).lean();

        // Step 2: Loop through each media item and check if it already exists in VendorMediaTextContentModel
        for (let item of adminMediaList) {
            let existingVendorMedia = await VendorMediaTextContentModel.findOne({
                media_text_contain_id: mongoose.Types.ObjectId(item._id),
                vendor_id: mongoose.Types.ObjectId(vendor_id)
            }).lean();

            // If the media content is not already present, insert it
            if (!existingVendorMedia) {
                // Prepare the new object for VendorMediaTextContentModel
                item.media_text_contain_id = mongoose.Types.ObjectId(item._id);
                item.vendor_id = mongoose.Types.ObjectId(vendor_id);
                delete item._id; // Remove the _id as it will be automatically generated for the new entry

                // Create a new instance of VendorMediaTextContentModel and save it
                let newVendorMediaTextContent = new VendorMediaTextContentModel(item);
                await newVendorMediaTextContent.save();
            }
        }

        // Step 3: Prepare query to fetch vendor media content
        let vendorQuery = {
            "$or": [{ status: 'active' }, { status: 'pending' }],
            vendor_id: mongoose.Types.ObjectId(vendor_id)
        };
        let vendorMediaList = [];
        let totalMediaContent = 0;

        // Step 4: Apply pagination if page and limit are provided
        if (page && limit) {
            vendorMediaList = await VendorMediaTextContentModel.find(vendorQuery)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ position: 1 })
                .lean();
            totalMediaContent = await VendorMediaTextContentModel.countDocuments(vendorQuery);
        } else {
            // Fetch all matching data if no pagination is provided
            vendorMediaList = await VendorMediaTextContentModel.find(vendorQuery).sort({ position: 1 }).lean();
        }

        // Step 5: Return data with total count from admin table
        let apiResponse = response.generate(0, 'Success', { vendorMediaList, totalMediaContent });
        res.status(200).send(apiResponse);

    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 13/1/2025
    * @Date_Modified  13/1/2025
    * @function async
    * @functionName uploadFiles
    * @functionPurpose to upload Media Text Content image
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let uploadFiles = async (req, res) => {
    let file = req.files;
    let fileUrl = {
        _id: uuidv4(),
        fileUrl: 'https://ralbaassetstorage.s3.us-east-2.amazonaws.com/' + file['image'][0].key
    }
    //console.log(fileUrl);
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 13/1/2025
    * @Date_Modified   13/1/2025
    * @function async
    * @functionName mediaTextContentDetails
    * @functionPurpose  get details of a particular Media Text Content
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let mediaTextContentDetails = async (req, res) => {
    try {
        let mediaTextContainId = mongoose.Types.ObjectId(req.body.media_text_contain_id);
        let vendorId = mongoose.Types.ObjectId(req.user.vendor_id);

        // Try to find vendor-modified content first
        let vendorRecord = await VendorMediaTextContentModel.findOne({
            media_text_contain_id: mediaTextContainId,
            vendor_id: vendorId,
            "$or": [{ status: 'active' }, { status: 'pending' }]
        }).lean();
        if (vendorRecord) {
            // If vendor-modified content exists, return it
            let apiResponse = response.generate(0, `Success`, vendorRecord);
            res.status(200).send(apiResponse);
        } else {
            // Fallback to the original content in the admin MediaTextContentModel
            let adminRecord = await MediaTextContentModel.findOne({
                _id: mediaTextContainId,
                "$or": [{ status: 'active' }, { status: 'pending' }]
            }).lean();

            if (!adminRecord) {
                throw new Error('Media Text Content not found or inactive');
            }

            let apiResponse = response.generate(0, `Success`, adminRecord);
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        // Handle errors
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 13/1/2025
    * @Date_Modified  13/1/2025
    * @function async
    * @functionName updateMediaTextContent
    * @functionPurpose  update a perticular Media Text Content
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let updateMediaTextContent = async (req, res) => {
    try {
        if (req.user.vendor_type == 'access' && req.user.is_copy) {
            let apiResponse = response.generate(1, `You are not authorized`, null);
            res.status(200).send(apiResponse);
            return;
        } else {
            let reqbody = req.body;
            let updatedMediaTextContent = {};
            let mediaTextContentDetail = await MediaTextContentModel.findOne({ _id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }).lean();

            // Check if the media text content ID exists in the admin media table
            if (checkLib.isEmpty(mediaTextContentDetail)) {
                throw new Error('Media Text Content id is not valid, please check once');
            }

            // Check if the vendor already has an entry in VendorMediaTextContentModel for this media content
            let vendorMediaTextContentDetail = await VendorMediaTextContentModel.findOne({
                media_text_contain_id: mongoose.Types.ObjectId(req.body.media_text_contain_id),
                vendor_id: mongoose.Types.ObjectId(req.user.vendor_id)
            }).lean();

            console.log('vendorMediaTextContentDetail0000000000', vendorMediaTextContentDetail);

            // Prepare the update object based on the request body
            for (const property in reqbody) {
                updatedMediaTextContent[property] = reqbody[property];
            }
            if (Array.isArray(reqbody.tag_List)) {
                updatedMediaTextContent.tags = reqbody.tag_List;
                delete updatedMediaTextContent.tag_List;
            }
            updatedMediaTextContent.vendor_id = req.user.vendor_id;  // Ensure vendor ID is stored with the record
            updatedMediaTextContent.media_text_contain_id = req.body.media_text_contain_id;  // Reference to the admin media content

            let updateMediaTextContentData;
            // If vendor content exists, update the VendorMediaTextContentModel
            if (!checkLib.isEmpty(vendorMediaTextContentDetail)) {

                updateMediaTextContentData = await VendorMediaTextContentModel.findOneAndUpdate(
                    {
                        media_text_contain_id: mongoose.Types.ObjectId(req.body.media_text_contain_id),
                        vendor_id: mongoose.Types.ObjectId(req.user.vendor_id)
                    },
                    updatedMediaTextContent,
                    { new: true }
                );
            } else {
                // If no vendor content exists, insert new record in VendorMediaTextContentModel
                let newVendorMediaTextContent = new VendorMediaTextContentModel(updatedMediaTextContent);
                updateMediaTextContentData = await newVendorMediaTextContent.save();
            }

            console.log('updateMediaTextContentData', updateMediaTextContentData);

            // Return success response with the updated/inserted data
            let apiResponse = response.generate(0, `Success`, updateMediaTextContentData);
            res.status(200).send(apiResponse);
        }



    } catch (err) {
        // Handle any errors and send failure response
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};



/**
    * @author Munnaf Hossain Mondal
    * @Date_Created  4/2/2025
    * @Date_Modified  4/2/2025
    * @function async
    * @functionName mediaTextContentChangePosition
    * @functionPurpose  change postion of media text section
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let mediaTextContentChangePosition = async (req, res) => {
    try {
        const updatedItems = req.body;
        const vendorId = req.user.vendor_id; // Assuming vendor_id is available from the authenticated user

        for (let item of updatedItems) {
            let vendorMediaTextContentDetail
            if (item.hasOwnProperty('media_text_contain_id')) {
                // Check if the media text content already exists for the vendor
                vendorMediaTextContentDetail = await VendorMediaTextContentModel.findOne({
                    media_text_contain_id: mongoose.Types.ObjectId(item.media_text_contain_id),
                    vendor_id: mongoose.Types.ObjectId(vendorId)
                }).lean();
            }


            // If exists, update position, else create a new entry
            if (vendorMediaTextContentDetail) {
                // Update the position of the existing record
                await VendorMediaTextContentModel.findByIdAndUpdate(
                    vendorMediaTextContentDetail._id,
                    { position: item.position }
                );
            }
        }

        let apiResponse = response.generate(0, `Success`, {});
        res.status(200).send(apiResponse);

    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain
    * @Date_Created 10/10/2025
    * @Date_Modified  10/10/2025
    * @function async
    * @functionName tagList
    * @functionPurpose  tag List show
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */

let tagList = async (req, res) => {
    // Default values for pagination
    let page = req.query.page ? parseInt(req.query.page) : null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        // Base query to filter active and pending tags
        let query = { "$or": [{ status: 'active' }, { status: 'pending' }] };
        let tagList;
        const totalTags = await Tag.countDocuments(query); // Total count for tag matching the query

        // If page and limit are provided, apply pagination
        if (page && limit) {
            tagList = await Tag.find(query).skip((page - 1) * limit).limit(limit).lean();
            // Return paginated data with total count
            let apiResponse = response.generate(0, `Success`, { tagList, totalTags });
            res.status(200).send(apiResponse);
        } else {
            // If no pagination params are provided, return all matching tags
            tagList = await Tag.find(query).lean();
            // Return only the tagList
            let apiResponse = response.generate(0, `Success`, tagList);
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


module.exports = {
    mediaTextContentList: mediaTextContentList,
    uploadFiles: uploadFiles,
    mediaTextContentDetails: mediaTextContentDetails,
    updateMediaTextContent: updateMediaTextContent,
    mediaTextContentChangePosition: mediaTextContentChangePosition,
    tagList: tagList
}
