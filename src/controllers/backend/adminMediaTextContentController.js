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
        // Base query to filter active and pending MediaTextContent
        let query = { "$or": [{ status: 'active' }, { status: 'pending' }] };
        let mediaTextContentList;
        const totalMediaTextContentList = await MediaTextContentModel.countDocuments(query); // Total count matching the query

        // If page and limit are provided, apply pagination
        if (page && limit) {
            mediaTextContentList = await MediaTextContentModel.find(query).skip((page - 1) * limit).limit(limit).sort({ position: 1 }).lean();
            // Return paginated data with total count
            let apiResponse = response.generate(0, `Success`, { mediaTextContentList, totalMediaTextContentList });
            res.status(200).send(apiResponse);
        } else {
            // If no pagination params are provided, return all matching MediaTextContent
            mediaTextContentList = await MediaTextContentModel.find(query).sort({ position: 1 }).lean();
            // Return only the mediaTextContentList
            let apiResponse = response.generate(0, `Success`, mediaTextContentList);
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 13/1/2025
    * @Date_Modified  13/1/2025
    * @function async
    * @functionName createMediaTextContent
    * @functionPurpose  to create Media Text Content
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createMediaTextContent = async (req, res) => {
    try {
        // Find the document with the highest position
        const lastItem = await MediaTextContentModel.findOne().sort({ position: -1 });

        // Calculate the new position
        const newPosition = lastItem ? lastItem.position + 1 : 1; // If no items exist, start at position 1

        let newMediaTextContent = new MediaTextContentModel({
            heading_text: req.body.heading_text,
            section_image: req.body.section_image,
            section_image_name: req.body.section_image_name,
            description_text: req.body.description_text,
            tags: req.body.tag_List ? req.body.tag_List : [],
            status: 'active',
            position: newPosition,
        });
        let newMediaTextContentData = await newMediaTextContent.save();
        let apiResponse = response.generate(0, ` Success`, newMediaTextContentData);
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
        let record = await MediaTextContentModel.findOne({ _id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }).lean();
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
        let reqbody = req.body;
        let updatedMediaTextContent = {};
        let mediaTextContentDetail = await MediaTextContentModel.findOne({ _id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }).lean();
        if (checkLib.isEmpty(mediaTextContentDetail)) {
            throw new Error('Media Text Content id is not valid please check once')
        }
        let updateMediaTextContentData
        if (reqbody.status != 'deleted') {
            for (const property in reqbody) {
                updatedMediaTextContent[property] = reqbody[property];
            }
            updateMediaTextContentData = await MediaTextContentModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }, updatedMediaTextContent, { new: true });
        }
        else {
            for (const property in reqbody) {
                updatedMediaTextContent[property] = reqbody[property];
            }
            updateMediaTextContentData = await MediaTextContentModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }, updatedMediaTextContent, { new: true });

            let statusObj =
            {
                status: "deleted"
            }
            // await VendorMediaTextContentModel.findOneAndUpdate({ media_text_contain_id: mongoose.Types.ObjectId(req.body.media_text_contain_id) }, statusObj, { new: true });
            await VendorMediaTextContentModel.updateMany(
                { media_text_contain_id: mongoose.Types.ObjectId(req.body.media_text_contain_id) },
                statusObj
            );

            await reorderActiveItems();
        }
        let apiResponse = response.generate(0, ` Success`, updateMediaTextContentData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}

async function reorderActiveItems() {
    // Fetch all items that are not marked as "deleted"
    const activeItems = await MediaTextContentModel.find({ status: { $ne: 'deleted' } }).sort({ position: 1 });

    // Reassign positions to remaining items
    for (let i = 0; i < activeItems.length; i++) {
        activeItems[i].position = i + 1; // Reassign new positions, starting from 1
        await activeItems[i].save(); // Save the updated item
    }
}


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
        for (let item of updatedItems) {
            await MediaTextContentModel.findByIdAndUpdate(item._id, { position: item.position });
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
    * @Date_Created 18/9/2025
    * @Date_Modified  18/9/2025
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

/**
 * updateMTGStatus
 * Admin: Changer le statut d'un MTG (pending → active ou inactive)
 */
let updateMTGStatus = async (req, res) => {
    try {
        let mtg_id = req.params.mtg_id;
        let { mtg_status } = req.body;

        if (!mtg_status || !['active', 'inactive'].includes(mtg_status)) {
            return res.status(400).send(response.generate(1, 'mtg_status must be "active" or "inactive"', {}));
        }

        let updatedMTG = await MediaTextContentModel.findByIdAndUpdate(
            mtg_id,
            { mtg_status: mtg_status },
            { new: true }
        );

        if (!updatedMTG) {
            return res.status(404).send(response.generate(1, 'MTG not found', {}));
        }

        // Keep vendor MTG copies in sync with platform MTG approval state.
        await VendorMediaTextContentModel.updateMany(
            {
                media_text_contain_id: mongoose.Types.ObjectId(mtg_id),
                status: { $ne: 'deleted' }
            },
            { $set: { mtg_status: mtg_status } }
        );

        let apiResponse = response.generate(0, `MTG status updated to ${mtg_status}`, updatedMTG);
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

/**
 * getPendingMTGs
 * Admin: Liste les MTGs en attente d'approbation
 */
let getPendingMTGs = async (req, res) => {
    try {
        let pendingMTGs = await MediaTextContentModel.find({ mtg_status: 'pending' })
            .populate('vendor_id', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        let apiResponse = response.generate(0, 'Success', { pendingMTGs });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(500).send(apiResponse);
    }
};

module.exports = {
    mediaTextContentList: mediaTextContentList,
    createMediaTextContent: createMediaTextContent,
    uploadFiles: uploadFiles,
    mediaTextContentDetails: mediaTextContentDetails,
    updateMediaTextContent: updateMediaTextContent,
    mediaTextContentChangePosition: mediaTextContentChangePosition,
    tagList: tagList,
    updateMTGStatus: updateMTGStatus,
    getPendingMTGs: getPendingMTGs,
}

