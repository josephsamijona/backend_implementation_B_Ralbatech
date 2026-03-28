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
const Product = require('../../models/productModel');
const Vendorbanner = require('../../models/vendorBannerModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const Store = require('../../models/storeModel');
const brand = require('../../models/brandModel');
const MasterModule = require('../../models/masterModules');
const sendemail = require("../../libs/sendmail");
const { v4: uuidv4 } = require('uuid');
const SubAdminModule = require('../../models/subAminModules');
const Category = require('../../models/categoryModel');


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
        //        // Step 1: Find all products for the vendor
        //        const products = await Product.find({ product_owner: req.user.vendor_id })
        //        .select('product_brand') // Select only the product_brand field
        //        .lean(); // Use lean() for better performance if you don't need Mongoose documents

        //    // Step 2: Extract unique brand IDs from the products
        //    const brandIds = [...new Set(products.map(product => product.product_brand))];

        //    // Step 3: Find all brands with the extracted IDs that are either 'active' or 'pending'
        //    const brands = await brand.find({
        //        _id: { $in: brandIds },
        //        $or: [{ status: 'active' }, { status: 'pending' }]
        //    });

        const brands = await brand.find({
            $or: [{ status: 'active' }, { status: 'pending' }]
        });

        let apiResponse = response.generate(0, ` Success`, brands);
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
    * @functionName bannerList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerList = async (req, res) => {
    try {
        let vendor_id
        if (req.user.vendor_type == 'access' && req.user.is_copy) {
            vendor_id = req.user.main_vendor_id;
        }
        else {
            vendor_id = req.user.vendor_id;
        }
        let record = await Vendorbanner.find({ "$or": [{ status: 'active' }, { status: 'pending' }], vendor_id: vendor_id });
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
    * @functionName subcategoryList
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let subcategoryList = async (req, res) => {
    try {
        // Fetch active parent categories
        let record = await Category.find({ status: 'active' }).lean();
        let allSubcategories = [];

        // Recursive function to collect all child categories
        const getAllChild = (data, result) => {
            let child = data.child_categories;

            // Only add to result if it's a child category
            if (!data.isParent) {
                result.push(data);
            }

            if (child && child.length) {
                for (let subcategory of child) {
                    getAllChild(subcategory, result);  // Recursively process all children
                }
            }
        };

        for (const element of record) {
            let result = [];

            // Mark the current category as a parent and get all subcategories
            element.isParent = true;
            getAllChild(element, result);

            // Add only unique subcategories to allSubcategories
            for (let item of result) {
                if (!allSubcategories.some(existingItem => existingItem.category_name === item.category_name)) {
                    allSubcategories.push(item);
                }
            }
        }

        // Generate API response
        let apiResponse = response.generate(0, "Success", allSubcategories);
        res.status(200).send(apiResponse);
    } catch (err) {
        let apiResponse = response.generate(0, `${err.message}`, {});
        res.status(410).send(apiResponse);
    }
};



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
    let apiResponse = response.generate(0, ` Success`, fileUrl);
    res.status(200);
    res.send(apiResponse);
}

/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerDetails
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerDetails = async (req, res) => {
    try {
        let record = await Vendorbanner.findOne({ _id: mongoose.Types.ObjectId(req.body.banner_id) });
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
    * @functionName bannerUpdate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerUpdate = async (req, res) => {
    try {
        let reqbody = req.body;
        let updatedBanner = {};
        updatedBanner['status'] = 'pending';
        for (const property in reqbody) {
            updatedBanner[property] = reqbody[property];
        }
        await Vendorbanner.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.banner_id) }, updatedBanner, { new: true });

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
            "template": `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have Updated BANNER. Plaese APPROVE  my banner.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-banner-list/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            "receiver_mail": [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            "subject": `Ralba Technologies : Updated BANNER`

        }
        sendemail.sendMailFunc(option);

        let apiResponse = response.generate(0, ` Success`, updatedBanner);
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
    * @functionName bannerCreate
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerCreate = async (req, res) => {
    try {
        let newbanner = new Vendorbanner({
            vendor_id: req.user.vendor_id,
            banner_title: req.body.banner_title,
            banner_subtitle: req.body.banner_subtitle,
            banner_background_image: req.body.banner_background_image,
            banner_background_image_name: req.body.banner_background_image_name,
            banner_title_color: req.body.banner_title_color,
            banner_subtitle_color: req.body.banner_subtitle_color,
            banner_button_bg_color: req.body.banner_button_bg_color,
            banner_button_text_color: req.body.banner_button_text_color,
            banner_sub_categories: Array.isArray(req.body.banner_sub_categories) && req.body.banner_sub_categories.length > 0 ? req.body.banner_sub_categories : [],
            banner_top_brands: Array.isArray(req.body.banner_top_brands) && req.body.banner_top_brands.length > 0 ? req.body.banner_top_brands : [],
            banner_homepage_brands: Array.isArray(req.body.banner_homepage_brands) && req.body.banner_homepage_brands.length > 0 ? req.body.banner_homepage_brands : [],
            status: 'pending'
        });

        let vendorModule = await MasterModule.findOne({ module_name: 'vendor' }).lean();

        let alladmins = await SubAdminModule.aggregate([
            {
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

        let admin_emails = alladmins.map((elem) => elem.subadmin.email);

        let option = {
            template: `<h3>Hi!</h3><br/><p>I am Vendor of Ralba Technologies. I have new BANNER Created. Please APPROVE my banner.</p><br/> Here is the link for approve <a href='https://admin.ralbatech.com/vendors/vendor-banner-list/${req.user.vendor_id}'>Click here</a> <br/> <br/><p>NOTE : Before approve please login as admin to approve with this link.</p><br/><br/><p>Regards,<br/>Ralba Technologies Team</p>`,
            receiver_mail: [`${process.env.ADMIN_EMAIL}`, ...admin_emails],
            subject: `Ralba Technologies : New BANNER Created`
        };

        sendemail.sendMailFunc(option);

        await newbanner.save((err, savedBanner) => {
            if (err) {
                let apiResponse = response.generate(1, `Error while saving banner`, err);
                res.status(500).send(apiResponse);
            } else {
                let apiResponse = response.generate(0, `Success`, savedBanner);
                res.status(200).send(apiResponse);
            }
        });
    } catch (error) {
        console.error("Error in bannerCreate:", error);
        let apiResponse = response.generate(1, `Internal Server Error`, error.message);
        res.status(500).send(apiResponse);
    }
};


/**
    * @author Munnaf Hossain Mondal
    * @Date_Created 
    * @Date_Modified  
    * @function async
    * @functionName bannerDelete
    * @functionPurpose  
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let bannerDelete = async (req, res) => {
    try {

        let dData = await Vendorbanner.deleteOne({ _id: mongoose.Types.ObjectId(req.body.banner_id) });
        let apiResponse = response.generate(0, ` Success`, dData);
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
    subcategoryList: subcategoryList,
    bannerList: bannerList,
    uploadFiles: uploadFiles,
    bannerCreate: bannerCreate,
    bannerDetails: bannerDetails,
    bannerUpdate: bannerUpdate,
    bannerDelete: bannerDelete

}