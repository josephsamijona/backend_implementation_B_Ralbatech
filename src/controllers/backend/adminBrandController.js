/**
 * @author Munnaf Hossain Mondal <munnaf.hossain@redappletech.com>
 * @version 1.2.1
 * create date : Monday 5 Feb 2024 12∶18∶31 PM
 * last Update : Monday 5 Feb 2024 12∶18∶31 PM
 * Note:  Brand control related functions are there
 * Last Update By : Munnaf Hossain Mondal
 */


const response = require("../../libs/responseLib");
// Import Model
const Brand = require('../../models/brandModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const checkLib = require("../../libs/checkLib");


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
    // Default values for pagination
    let page = req.query.page ? parseInt(req.query.page) : null;
    let limit = req.query.limit ? parseInt(req.query.limit) : null;
    let category_id = req.query.category_id ? req.query.category_id : null;

    try {
        // Base query to filter active and pending brands
        let query = { "$or": [{ status: 'active' }, { status: 'pending' }] };

        // If category_id is present, add category filtering condition
        if (category_id) {
            query['categories._id'] = category_id;  // Match category_id in the categories array
        }

        let brandList;
        const totalBrands = await Brand.countDocuments(query); // Total count for brands matching the query

        // If page and limit are provided, apply pagination
        if (page && limit) {
            brandList = await Brand.find(query).skip((page - 1) * limit).limit(limit).lean();
            // Return paginated data with total count
            let apiResponse = response.generate(0, `Success`, { brandList, totalBrands });
            res.status(200).send(apiResponse);
        } else {
            // If no pagination params are provided, return all matching brands
            brandList = await Brand.find(query).lean();
            // Return only the brandList
            let apiResponse = response.generate(0, `Success`, brandList);
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
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName searchBrandList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let searchBrandList = async (req, res) => {
    // Default values for pagination
    let category_id = req.query.category_id ? req.query.category_id : null;
    let search = req.query.search || ''; // Extract search query from request params

    try {
        // Base query to filter active and pending brands
        let query = {
            "$or": [{ status: 'active' }, { status: 'pending' }]
        };

        // If category_id is present, add category filtering condition
        if (category_id) {
            query['categories._id'] = category_id;  // Match category_id in the categories array
        }

        // Add brand name search condition using regex (case-insensitive)
        if (search) {
            query['brand_name'] = { $regex: search, $options: 'i' }; // Search by brand name
        }

        // Fetch total count of matching brands
        const totalBrands = await Brand.countDocuments(query);

        // Apply pagination and fetch brand list
        let brandList = await Brand.find(query)
            .lean();

        // Send response with paginated brands and total count
        let apiResponse = response.generate(0, `Success`, { brandList, totalBrands });
        res.status(200).send(apiResponse);

    } catch (err) {
        // Handle any errors
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brandCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandCreate = async (req, res) => {
    try {
        let brandslug = genLib.createSlug(req.body.brand_name);
        let count_find_brand = await Brand.countDocuments({ "brand_slug": { $regex: '.*' + brandslug + '.*' } })

        let newBrand = new Brand({
            brand_name: req.body.brand_name,
            categories: req.body.categories,
            brand_slug: (count_find_brand > 0) ? brandslug + '-' + (count_find_brand + 1) : brandslug,
            brand_image: req.body.brand_image,
            brand_image_name: req.body.brand_image_name,
            status: 'active'
        });
        let newBrandData = await newBrand.save();
        let apiResponse = response.generate(0, ` Success`, newBrandData);
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
    * @functionName uploadFiles
    * @functionPurpose  
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
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brandDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandDetails = async (req, res) => {
    try {
        let record = await Brand.findOne({ _id: mongoose.Types.ObjectId(req.body.brand_id) }).lean();
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
    * @functionName brandUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedBrand = {};

        // Handle brand_name and brand_slug logic
        if (req.body.brand_name) {
            let brandslug_final = '';
            let brandslug = genLib.createSlug(req.body.brand_name);
            let count_find_brand = await Brand.countDocuments({ "brand_slug": { $regex: '.*' + brandslug + '.*' } });
            let brandDetail = await Brand.find({ _id: mongoose.Types.ObjectId(req.body.brand_id) }).lean();

            if (brandDetail[0].brand_name === req.body.brand_name) {
                brandslug_final = brandDetail[0].brand_slug;
            } else {
                brandslug_final = (count_find_brand > 0) ? `${brandslug}-${count_find_brand + 1}` : brandslug;
            }

            updatedBrand.brand_slug = brandslug_final;
        }

        // Add brand_image and brand_image_name if provided
        if (reqbody.brand_image) {
            updatedBrand.brand_image = reqbody.brand_image;
        }
        if (reqbody.brand_image_name) {
            updatedBrand.brand_image_name = reqbody.brand_image_name;
        }

        // Add other fields dynamically
        for (const property in reqbody) {
            if (property !== 'brand_image' && property !== 'brand_image_name') {
                updatedBrand[property] = reqbody[property];
            }
        }

        // Update brand in the database
        let updateBrandData = await Brand.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(req.body.brand_id) },
            updatedBrand,
            { new: true }
        );

        let apiResponse = response.generate(0, `Success`, updateBrandData);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName brandDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let brandDelete = async (req, res) => {
    try {
        let updateBrand = {
            status: 'deleted'
        };

        await Brand.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.brand_id) }, updateBrand, { new: true });
        let apiResponse = response.generate(0, ` Success`, updateBrand);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse)
    }
}


module.exports = {
    brandList: brandList,
    searchBrandList: searchBrandList,
    brandCreate: brandCreate,
    uploadFiles: uploadFiles,
    brandDetails: brandDetails,
    brandUpdate: brandUpdate,
    brandDelete: brandDelete
}