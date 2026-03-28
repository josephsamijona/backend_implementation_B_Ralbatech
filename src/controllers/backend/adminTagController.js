/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Monday 9 Jan 2025 12∶18∶31 PM
 * last Update : Monday 9 Jan 2025 12∶18∶31 PM
 * Note:  Tag control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
// Import Model
const Tag = require('../../models/tagModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const checkLib = require("../../libs/checkLib");


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created  9/1/2025
    * @Date_Modified  9/1/2025
    * @function async
    * @functionName tagList
    * @functionPurpose  show list of tags
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
    * @author Munnaf Hossain Mondal
    * @Date_Created 9/1/2025
    * @Date_Modified  9/1/2025
    * @function async
    * @functionName createTag
    * @functionPurpose  to create tag
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let createTag = async (req, res) => {
    try {
        let tagslug = genLib.createSlug(req.body.tag_name);
        let count_find_tag = await Tag.countDocuments({ "tag_slug": { $regex: '.*' + tagslug + '.*' } })

        let newTag = new Tag({
            tag_name: req.body.tag_name,
            tag_slug: (count_find_tag > 0) ? tagslug + '-' + (count_find_tag + 1) : tagslug,
            tag_image: req.body.tag_image,
            tag_image_name: req.body.tag_image_name,
            tag_description: req.body.tag_description,
            web_view_status: req.body.web_view_status,
            status: 'active'
        });
        let newTagData = await newTag.save();
        let apiResponse = response.generate(0, ` Success`, newTagData);
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
    * @Date_Created 9/1/2025
    * @Date_Modified  9/1/2025
    * @function async
    * @functionName uploadFiles
    * @functionPurpose to upload tag image
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
    * @Date_Created 9/1/2025
    * @Date_Modified   9/1/2025
    * @function async
    * @functionName tagDetails
    * @functionPurpose  get details of a particular tag
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let tagDetails = async (req, res) => {
    try {
        let record = await Tag.findOne({ _id: mongoose.Types.ObjectId(req.body.tag_id) }).lean();
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
    * @Date_Created 9/1/2025
    * @Date_Modified  9/1/2025
    * @function async
    * @functionName updateTag
    * @functionPurpose  update a perticular tag
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let updateTag = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedTag = {};
        let tagDetail = await Tag.findOne({ _id: mongoose.Types.ObjectId(req.body.tag_id) }).lean();
        if (checkLib.isEmpty(tagDetail)) {
            throw new Error('Tag id is not valid please check once')
        }
        if (req.body.tag_name) {
            let tagslug_final = '';
            let tagslug = genLib.createSlug(req.body.tag_name);
            let count_find_tag = await Tag.countDocuments({ "tag_slug": { $regex: '.*' + tagslug + '.*' } })

            if (tagDetail.tag_name == req.body.tag_name) {
                tagslug_final = tagDetail.tag_slug
            } else {
                tagslug_final = (count_find_tag > 0) ? tagslug + '-' + (count_find_tag + 1) : tagslug
            }

            updatedTag = {
                tag_slug: tagslug_final,
            };
        }

        for (const property in reqbody) {
            updatedTag[property] = reqbody[property];
        }
        let updateTagData = await Tag.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.tag_id) }, updatedTag, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateTagData);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


module.exports = {
    tagList: tagList,
    createTag: createTag,
    uploadFiles: uploadFiles,
    tagDetails: tagDetails,
    updateTag: updateTag
}