/**
 * @author Pragyan Paramita Das <pragyan@redappletech.com>
 * @version 1.2.1
 * create date : Thursday 16 February 2023 12∶18∶31 PM
 * last Update : Friday 23rd February 2023 13:02:34 PM
 * Note:  Admin Category,Subcategory and Childubcategory control related functions are there
 * Last Update By : Pragyan Paramita Das
 */


const response = require("../../libs/responseLib");
// Import Model
const category = require('../../models/categoryModel');
const subcategory = require('../../models/subcategoryModel');
const childsubcategory = require('../../models/childsubcategoryModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const Category = require('../../models/categoryModel');



/**
 *Add SubCategory item
 *Post
 * @param {*} req //SubCategory_name,SubCategory_image
 * @param {*} res //show SubCategory list
 */
let createSubCategory = async (req, res) => {
    try {

        let checksubCategory = await subcategory.find({
            status: 'active',
            subcategory_name: req.body.subcategory_name,
            subcategory_category: mongoose.Types.ObjectId(req.body.subcategory_category)

        });

        //console.log(checkroom); return;
        if (checksubCategory.length == 0) {
            let subcategoryslug = genLib.createSlug(req.body.subcategory_name);
            let newsubCategory = new subcategory({
                subcategory_name: req.body.subcategory_name,
                subcategory_slug: subcategoryslug,
                category_id: req.body.category_id,
                subcategory_image: req.body.subcategory_image
            });

            await newsubCategory.save((err, newsubCategory) => {
                //console.log(err);
                let apiResponse = response.generate(0, ` Success`, newsubCategory);
                res.status(200);
                res.send(apiResponse);
            });

        } else {
            let apiResponse = response.generate(1, ` Sub Category already exists .`, {});
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
 *Add ChildSubCategory item
 *Post
 * @param {*} req //ChildSubCategory_name,ChildSubCategory_image
 * @param {*} res //show ChildSubCategory list
 */

let createChildSubCategory = async (req, res) => {
    try {

        let checkChildsubCategory = await childsubcategory.find({
            status: 'active',
            childsubcategory_name: req.body.childsubcategory_name,
            child_subcategory: mongoose.Types.ObjectId(req.body.child_subcategory)
        });


        if (checkChildsubCategory.length == 0) {
            let childsubcategoryslug = genLib.createSlug(req.body.childsubcategory_name);
            let newchildsubCategory = new childsubcategory({
                childsubcategory_name: req.body.childsubcategory_name,
                childsubcategory_slug: childsubcategoryslug,
                category_id: req.body.category_id,
                subcategory_id: req.body.subcategory_id,
                childsubcategory_image: req.body.childsubcategory_image
            });
            await newchildsubCategory.save((err, newchildsubCategory) => {
                //console.log(err);
                let apiResponse = response.generate(0, ` Success`, newchildsubCategory);
                res.status(200);
                res.send(apiResponse);
            });
        } else {
            let apiResponse = response.generate(1, ` Child subCategory already exists .`, {});
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
 *Show ChildSubcategory list
 *GET
 * @param {*} req 
 * @param {*} res //show ChildSubcategory details
 */

let ChildSubcategoryList = async (req, res) => {
    try {
        record = await childsubcategory.aggregate([{
            $match: {
                $and: [
                    { status: 'active' },
                    { category_id: mongoose.Types.ObjectId(req.body.category_id) },
                    { subcategory_id: mongoose.Types.ObjectId(req.body.subcategory_id) }
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

        {
            $lookup: {
                from: "subcategories",
                localField: "subcategory_id",
                foreignField: "_id",
                as: "subcategory",
            }
        },
        //{ $unwind: '$product_subcategory' },
        {
            $unwind: {
                path: "$subcategory"
            }
        },

        { $limit: 100 },
        {
            "$project": {
                "_id": 1,
                "childsubcategory_name": 1,
                "childsubcategory_slug": 1,
                "childsubcategory_image": 1,
                "category_id": 1,
                "category._id": 1,
                "category.category_name": 1,
                "category.category_slug": 1,
                "category.category_image": 1,
                "category.status": 1,
                "subcategory._id": 1,
                "subcategory.subcategory_name": 1,
                "subcategory.subcategory_slug": 1,
                "subcategory.subcategory_image": 1,
                "subcategory.status": 1,
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
 * @author Md Mustakim Sarkar
 * @Created_date 05-07-2023
 * Vendor category list
 * @param {*} req 
 * @param {*} res 
 */
let categoryList = async (req, res) => {

    try {
        let record = await Category.find({ status: 'active' });
        //console.log(record);

        //let record =  await Category.find({status:'active'}).populate('category_parent').lean();
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
    * @functionName categoryDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let categoryDetails = async (req, res) => {
    try {
        let record = await Category.findOne({ _id: mongoose.Types.ObjectId(req.body.category_id) });
        //console.log(record);

        //let record =  await Category.find({status:'active'}).populate('category_parent').lean();
        let apiResponse = response.generate(0, ` Success`, record);
        res.status(200);
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = response.generate(0, ` ${err.message}`, {});
        res.status(410);
        res.send(apiResponse);
    }
}


module.exports = {
    createSubCategory: createSubCategory,
    SubcategoryList: SubcategoryList,
    createChildSubCategory: createChildSubCategory,
    ChildSubcategoryList: ChildSubcategoryList,
    categoryList: categoryList,
    categoryDetails: categoryDetails
}
