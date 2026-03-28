/**
 * @author Pragyan Paramita Das <pragyan@redappletech.com>
 * @version 1.2.1
 * create date : Thursday 16 February 2023 12∶18∶31 PM
 * last Update : Friday 23rd February 2023 13:02:34 PM
 * Note:  Admin Category,Subcategory and Childubcategory control related functions are there
 * Last Update By : Md Mustakim Sarkar on 06-07-2023
 */


const response = require("../../libs/responseLib");
// Import Model
const category = require('../../models/categoryModel');
const subcategory = require('../../models/subcategoryModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const checkLib = require("../../libs/checkLib");
const addonModel = require("../../models/addonModel");

/**
 *uploadimage FOR category 
 *Post
 * @param {*} req //image
 * @param {*} res //show image list
 */
let catagoriesuploadimage = async (req, res) => {
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
 *Add category item
 *Post
 * @param {*} req //category_name,category_image
 * @param {*} res //show category list
 */
let createCategory = async (req, res) => {
    try {

        let checkCategory = await category.find({
            status: 'active',
            category_name: req.body.category_name,

        });
        if (!checkLib.isEmpty(req.body.add_ons)) { await Promise.all(req.body.add_ons.map(item => { item.addon_slug = genLib.createProductSlug(item.add_ons_name); item.add_ons_value.map(val => val.value_slug = genLib.createProductSlug(val.values)) })) }
        if (!checkLib.isEmpty(req.body.attributes)) { await Promise.all(req.body.attributes.map(item => { item.attribute_slug = genLib.createProductSlug(item.attribute_name); })) }
        if (checkCategory.length == 0) {
            let categoryslug = genLib.createSlug(req.body.category_name);
            let newCategory = new category({
                category_name: req.body.category_name,
                category_slug: categoryslug,
                category_image: req.body.category_image,
                category_image_name: req.body.category_image_name,
                sub_categories: [],
                addons: !checkLib.isEmpty(req.body.add_ons) ? req.body.add_ons : [],
                add_ons_json_name: req.body.add_ons_json_name,
                attributes: !checkLib.isEmpty(req.body.attributes) ? req.body.attributes : [],
                attributes_json_name: req.body.attributes_json_name,
            });

            await newCategory.save((err, newCategory) => {
                //console.log(err);
                let apiResponse = response.generate(0, ` Success`, newCategory);
                res.status(200);
                res.send(apiResponse);
            });

        } else {
            let apiResponse = response.generate(1, ` Category already exists .`, {});
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
 *Show category list
 *GET
 * @param {*} req 
 * @param {*} res //show category details
 */
let categoryList = async (req, res) => {
    try {

        // Get page and limit from request query, with defaults to 0
        const page = parseInt(req.query.page) || 0; // Default to 0 if not provided
        const limit = parseInt(req.query.limit) || 0; // Default to 0 if not provided

        // Check if both page and limit are 0
        if (page === 0 && limit === 0) {
            // Return all vendors without pagination
            let record = await category.find({ status: 'active' });
            let apiResponse = response.generate(0, ` Success`, record);
            res.status(200).send(apiResponse);
        } else {
            // Calculate the number of vendors to skip for pagination
            const skip = (page - 1) * limit;
            const categoryList = await category.find({ status: 'active' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
            const totalCategory = await category.countDocuments({ status: 'active' }); // Get the total number of vendors

            // Prepare API response with pagination details
            let apiResponse = response.generate(0, `Success`, {
                categoryList,
                totalCategory,
            });
            res.status(200).send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


/**
 *Search category list
 *GET
 * @param {*} req 
 * @param {*} res //show category details
 */
let searchCategoryList = async (req, res) => {
    try {

        let search = req.query.search || ''; // Extract search query from request params
        let searchCondition = { category_name: { $regex: search, $options: 'i' } };
        const categoryList = await category.find(searchCondition).sort({ createdAt: -1 }).lean();
        const totalCategory = await category.countDocuments(searchCondition); // Get the total number of vendors

        // Prepare API response with pagination details
        let apiResponse = response.generate(0, `Success`, {
            categoryList,
            totalCategory,
        });
        res.status(200).send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
 *Update category list
 *POST
 * @param {*} req //category_id
 * @param {*} res //show category details
 */

let updateCategory = async (req, res) => {
    try {
        let categoriesData
        let categoryslug_final = '';
        let categoryslug = genLib.createSlug(req.body.category_name);
        let count_find_category = await category.countDocuments({ "create_slug": { $regex: '.*' + categoryslug + '.*' } })
        let categorydetail = await category.find({ _id: mongoose.Types.ObjectId(req.body.category_id) }).lean();
        if (categorydetail[0].category_name == req.body.category_name) {
            categoryslug_final = req.body.category_slug
        } else {
            categoryslug_final = categoryslug + '-' + (count_find_category + 1)
        }
        let updateAdd_ons = 1;
        if (!checkLib.isEmpty(req.body.add_ons)) {
            for (let item of req.body.add_ons) {
                if (!checkLib.isEmpty(item.addon_slug)) {
                    updateAdd_ons = 0;
                    break;
                }

            }
        }
        else {
            updateAdd_ons = 0;
        }

        let updateAttribute = 1;
        if (!checkLib.isEmpty(req.body.attributes)) {
            for (let item of req.body.attributes) {
                if (!checkLib.isEmpty(item.attribute_slug)) {
                    updateAttribute = 0;
                    break;
                }
            }
        } else {
            updateAttribute = 0;
        }
        if (!checkLib.isEmpty(req.body.add_ons)) { await Promise.all(req.body.add_ons.map(item => { item.addon_slug = genLib.createProductSlug(item.add_ons_name); item.add_ons_value.map(val => val.value_slug = genLib.createProductSlug(val.values)) })) }
        if (!checkLib.isEmpty(req.body.attributes)) { await Promise.all(req.body.attributes.map(item => { item.attribute_slug = genLib.createProductSlug(item.attribute_name); })) }

        //checking if the category add_on already used as product addons and the new data has the add_on or not
        if (!checkLib.isEmpty(req.body.add_ons)) {
            for (let item of req.body.add_ons) {
                let exist = await addonModel.find({ "add_ons.addon_slug": item.addon_slug });
                let updateexist = await req.body.add_ons.findIndex(e => e.addon_slug == item.addon_slug);

                if ((exist && exist.length) && updateexist == -1) {
                    updateAdd_ons = 0;
                    break;
                }
            }
        }

        // Flags to force updating to empty arrays when explicitly provided
        let forceEmptyAddons = Array.isArray(req.body.add_ons) && req.body.add_ons.length === 0;
        let forceEmptyAttributes = Array.isArray(req.body.attributes) && req.body.attributes.length === 0;

        let updateCategory = {
            category_name: req.body.category_name,
            category_slug: categoryslug,
            category_image: req.body.category_image,
            category_image_name: req.body.category_image_name,
            sub_categories: [],
            addons: forceEmptyAddons ? [] : req.body.add_ons,
            add_ons_json_name: req.body.add_ons_json_name,
            attributes: forceEmptyAttributes ? [] : req.body.attributes,
            attributes_json_name: req.body.attributes_json_name,
        };
        if (updateAdd_ons == 0 && !forceEmptyAddons) {
            delete updateCategory.addons;
            //console.log("add_ons not updated.**********************************")
        }
        if (updateAttribute == 0 && !forceEmptyAttributes) {
            delete updateCategory.attributes;
        }
        categoriesData = await category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.category_id) }, updateCategory, { new: true });

        let apiResponse = response.generate(0, ` Success`, categoriesData);
        res.status(200);
        res.send(apiResponse);

    } catch (err) {
        //console.log(err);
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

let findCategoryId = (json, targetId) => {
    for (let i = 0; i < json.length; i++) {
        const category = json[i];
        if (category.category_id === targetId) {
            return category;
        } else if (category.child_categories.length > 0) {
            const result = findCategoryId(category.child_categories, targetId);
            if (result) {
                return result;
            }
        }
    }
    return null;
}
/**
 * 
 * @param {*} entireObj object
 * @param {*} keyToFind string
 * @param {*} valToFind string
 * @returns 
 */
function findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj = null;
    JSON.stringify(entireObj, (_, nestedValue) => {

        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj;
};
/**
 * gets array of object and finds eact object for the targetId of the specified key To Find
 * @param {*} json array of objects
 * @param {*} keyToFind string
 * @param {*} targetId string
 * @returns 
 */
let findParentObjectById = (json, keyToFind, targetId) => {
    for (let parent of json) {
        let isFound = findNestedObj(parent, keyToFind, targetId);
        if (isFound) {
            return parent;
        }
    }
    return null;
}
let deleteCategoryById = (data, target) => {
    const json = data;
    const targetId = target;
    let deleteMachine = (json, targetId) => {
        for (let i = 0; i < json.length; i++) {
            const category = json[i];
            if (category.category_id === targetId) {
                json.splice(i, 1); // Remove the matched object from the array
                return;
            } else if (category.child_categories.length > 0) {
                deleteMachine(category.child_categories, targetId);
            }
        }
    }
    deleteMachine(json, targetId);
    return json;
}


let catagoriesDetails = async (req, res) => {

    try {
        let record = await category.find({ status: 'active', _id: mongoose.Types.ObjectId(req.body.category_id) });
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
 *Delete category list
 *POST
 * @param {*} req //category_id
 * @param {*} res //show response sucess or failure
 */
let categoryDelete = async (req, res) => {
    try {
        let updatedCtegory = {
            status: 'deleted',
        };
        await category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.category_id) }, updatedCtegory, { new: true });

        let apiResponse = response.generate(0, ` Success`, updatedCtegory);
        res.status(200);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}

/**
 *Add SubCategory item
 *Post
 * @param {*} req //SubCategory_name,SubCategory_image
 * @param {*} res //show SubCategory list
 */
let createSubCategory = async (req, res) => {
    try {

        let categorydetail = await category.find({ _id: mongoose.Types.ObjectId(req.body.category_id) }).lean();
        if (categorydetail.length > 0) {
            if (req.body.child_categories_id) {
                const targetId = req.body.child_categories_id;
                let categoryDetails = findCategoryId(categorydetail[0].child_categories, targetId);
                let subObj =
                {
                    category_id: uuidv4(),
                    category_name: req.body.child_category_name,
                    category_slug: genLib.createSlug(req.body.child_category_name),
                    child_categories: []
                }
                categoryDetails.child_categories.push(subObj);

            }
            else {

                let subObj = {
                    category_id: uuidv4(),
                    category_name: req.body.child_category_name,
                    category_slug: genLib.createSlug(req.body.child_category_name),
                    child_categories: []
                }
                categorydetail[0].child_categories.push(subObj);
            }
            let cat_record = await category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.category_id) }, categorydetail[0], { new: true });

            let apiResponse = response.generate(0, ` Success : Sub Category created .`, cat_record);
            res.status(200);
            res.send(apiResponse);
        }
        else {
            let apiResponse = response.generate(1, ` Category does not exists .`, {});
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
 *Show Subcategory list
 *GET
 * @param {*} req 
 * @param {*} res //show Subcategory details
 */

let SubcategoryList = async (req, res) => {
    try {
        record = await subcategory.aggregate([{
            $match: {
                $and: [
                    { status: 'active' },
                    { category_id: mongoose.Types.ObjectId(req.body.category_id) }
                ]
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "_id",
                as: "category",
            }
        },
        { $unwind: '$category' },



        { $limit: 100 },
        {
            "$project": {
                "_id": 1,
                "subcategory_name": 1,
                "subcategory_slug": 1,
                "subcategory_image": 1,
                "category_id": 1,
                "category._id": 1,
                "category.category_name": 1,
                "category.category_slug": 1,
                "category.status": 1,
                "status": 1,
                "createdAt": 1,
                "updatedAt": 1

            }
        }

        ]);
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
 *Update SubCategory list
 *POST
 * @param {*} req //SubCategory_id
 * @param {*} res //show SubCategory details
 */
let updateSubCategory = async (req, res) => {
    try {
        let categorydetail = await category.find({ _id: mongoose.Types.ObjectId(req.body.category_id) }).lean();
        if (categorydetail.length > 0) {
            if (req.body.child_categories_id) {
                const targetId = req.body.child_categories_id;
                let categoryDetails = findCategoryId(categorydetail[0].child_categories, targetId);
                categoryDetails.category_name = req.body.child_category_name;
                categoryDetails.category_slug = genLib.createSlug(req.body.child_category_name);
            }
            let cat_record = await category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.category_id) }, categorydetail[0], { new: true });

            let apiResponse = response.generate(0, ` Success : Sub Category Update Sucessfully .`, cat_record);
            res.status(200);
            res.send(apiResponse);
        }
        else {
            let apiResponse = response.generate(1, ` Category does not exists .`, {});
            res.status(410);
            res.send(apiResponse);
        }

    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


let subcatagoriesDetails = async (req, res) => {

    try {
        let record = await subcategory.find({ _id: mongoose.Types.ObjectId(req.body.subcategory_id) });
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
 *Delete Subcategory list
 *POST
 * @param {*} req //category_id
 * @param {*} res //show response sucess or failure
 */
let SubcategoryDelete = async (req, res) => {
    try {
        let categorydetail = await category.find({ _id: mongoose.Types.ObjectId(req.body.category_id) }).lean();
        //console.log('categorydetail Before delete ==========>', categorydetail)
        if (categorydetail.length > 0) {
            if (req.body.child_categories_id) {
                const targetId = req.body.child_categories_id;
                let categoryDetails = deleteCategoryById(categorydetail[0].child_categories, targetId);
                categorydetail[0].child_categories = categoryDetails;
                //console.log('categoryDetails==========>', categoryDetails)
            }
            //console.log('categorydetail After delete ==========>', categorydetail)

            let cat_record = await category.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.category_id) }, categorydetail[0], { new: true });

            let apiResponse = response.generate(0, ` Success : Sub Category Delete Sucessfully .`, cat_record);
            res.status(200);
            res.send(apiResponse);
        }
        else {
            let apiResponse = response.generate(1, ` Category does not exists .`, {});
            res.status(410);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = response.generate(1, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


module.exports = {
    createCategory: createCategory,
    categoryList: categoryList,
    searchCategoryList: searchCategoryList,
    updateCategory: updateCategory,
    catagoriesDetails: catagoriesDetails,
    categoryDelete: categoryDelete,
    createSubCategory: createSubCategory,
    SubcategoryList: SubcategoryList,
    updateSubCategory: updateSubCategory,
    subcatagoriesDetails: subcatagoriesDetails,
    SubcategoryDelete: SubcategoryDelete,
    catagoriesuploadimage: catagoriesuploadimage,

}
