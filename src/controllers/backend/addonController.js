/**
 * @author Md Mustakim Sarkar
 * @version 
 * create date : 04-07-2023
 * last Update : 
 * Note:  Vendor product addon manage controller
 * Last Update By : 
 */


const response = require("../../libs/responseLib");
const { v4: uuidv4 } = require('uuid');
// Import Model
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const genLib = require('../../libs/genLib');
const mongoose = require('mongoose');
const commonLib = require("../../libs/commonLib");
const addonModel = require("../../models/addonModel");
const checkLib = require("../../libs/checkLib");


/**
    * @author Md Mustakim Sarkar
    * @Date_Created 23/06/2023
    * @Date_Modified  
    * @function async
    * @functionName findAttributes
    * @functionPurpose  this function taken object and split keys and match specified filed_type is found in the last part
    * of the spilitted array. if found then other portion of the spilitted array is matched within an array provided as attribute
    * and if that key is found in the array also then we creting another result array of object with that key and value of the respectve key.
    *                                                   
    * @functionParam 
    *
    * @functionSuccess return result array as response 
    *
    * @functionError {Boolean} error error is there.
    */
let findAttributes = (data, attributes = [], field_type) => {
    try {
        //console.log(attributes)
        let result = [];
        let values = [];
        for (const [key, value] of Object.entries(data)) {
            let t = key.split('_');
            let lastField = t[t.length - 1];
            if (lastField == field_type || lastField == `${field_type}s`) {
                t.pop();
                t = t.join('_');
                let val = t.split('-');//seconday_lense-polycarbonate_shatter_resistant_lenses_addons": "212",
                if (val.length >= 2) {
                    t = val[0];
                    val.shift();
                    val = val.join('-');
                    let addon_index_in_attributes= attributes.findIndex(e => e[`${field_type}_slug`] == t || e[`${field_type}s_slug`] == t);
                    let value_index = attributes[addon_index_in_attributes].add_ons_value.findIndex(e=>e['value_slug'] == val);
                    let parent_name_value = attributes[addon_index_in_attributes].add_ons_value[value_index]['add_ons_parent_value'];
                    let parent_slug = genLib.createSlug(parent_name_value);
                    values.push({ [`${field_type}_slug`]: t, parent_value_slug: parent_slug, value_slug: val, price: value, values: "" });
                    //values.push({ [`${field_type}_slug`]: t, value_slug: val, price: value, values: "" });
                }
                //console.log(t)
                if (attributes.findIndex(e => e[`${field_type}_slug`] == t || e[`${field_type}s_slug`] == t) > -1) {
                    result.push({ [`${field_type}_slug`]: t, value: value });
                }
            }
        }
        return { result, values };
    } catch (error) {
        //console.log(error)
        return [];
    }
}

/**
    * @author Md Mustakim Sarkar
    * @Date_Created 03-07-2023
    * @Date_Modified  
    * @function async
    * @functionName addOnCreate
    * @functionPurpose  for creating add ons category wise
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let addOnCreate = async (req, res) => {
    try {
        //console.log("Add Ons Add:==================>");
        if (!(req.body.product_category_id)) {
            let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
            res.status(400);
            return res.send(apiResponse);
        }
        let isExist = await addonModel.findOne({ $and: [{ product_category_id: req.body.product_category_id }, { vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) }] })
        //console.log(isExist)

        let categoryDetails;
        req.body.product_category_id = req.body.product_category_id.toString();
        if (Buffer.from(req.body.product_category_id).length == 12 || Buffer.from(req.body.product_category_id).length == 24) {
            categoryDetails = await Category.findOne({ _id: mongoose.Types.ObjectId(req.body.product_category_id) });
        } else {
            categoryDetails = await Category.find();
            categoryDetails = await commonLib.findParentObject(categoryDetails, 'category_id', req.body.product_category_id);
        }

        let add_ons = [];
        let addonsData = findAttributes(req.body, categoryDetails.addons, 'addon')
        let addons = addonsData.result;
        //console.log(addonsData)
        for (let item of categoryDetails.addons) {
            if (item.is_mandatory && await addons.findIndex(e => e.addon_slug == item.addon_slug) == -1) {
                let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
                res.status(400);
                return res.send(apiResponse);
            }
            let checkdata = await addons.filter(e =>  e.addon_slug == item.addon_slug);
            
            let index = await checkdata.findIndex(e =>  checkLib.isEmpty(e.value)==true)
            //console.log(item.addon_slug, checkdata,index,item);
            if (item.is_mandatory==true &&  index > -1) {
                let apiResponse = response.generate(1, ` Please fill all mandatory fields addons`, null);
                res.status(400);
                return res.send(apiResponse);
            }
            let value_image = "";

            let temp = await addonsData.values.filter(e => e.addon_slug == item.addon_slug);

            await Promise.all(temp.map(async e => {
                e.value_image = "";
                let cat_addon = await item.add_ons_value.find(el => el.value_slug = e.value_slug);
                if (cat_addon)
                    e.value_image = cat_addon.value_image;
            }))

            item.add_ons_value = temp;

            if (!item.add_ons_value || item.add_ons_value.length == 0) {
                let index = await addons.findIndex(e => e.addon_slug == item.addon_slug)
                if (index > -1) {
                    item.add_ons_value = [{ addon_slug: item.addon_slug, value_slug: "", price: addons[index].value, value_image: value_image, values: "" }];
                }
            }
           
            add_ons.push(item);

        }
        if (!isExist) {
            let newaddon = new addonModel({

                product_category_id: req.body.product_category_id,
                vendor_id: {
                    _id: req.user.vendor_id
                },
                add_ons: add_ons
            });


            let addonResult = await newaddon.save();
            //console.log('addonResult', addonResult)


            let apiResponse = response.generate(0, ` Successfully added`, addonResult);
            res.status(200);
            res.send(apiResponse);
        } else {
            let updatedAddon = {
                add_ons: add_ons
            };

            let updatedData = await addonModel.findOneAndUpdate({ product_category_id: req.body.product_category_id, vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) }, updatedAddon, { new: true });

            let apiResponse = response.generate(0, ` Successfully updated`, updatedData);
            res.status(200);
            res.send(apiResponse);
        }
    } catch (err) {
        //console.log(err)
        let apiResponse = response.generate(1, ` Something went wrong`, null);
        res.status(412);
        res.send(apiResponse);
    }
}
/**
    * @author Md Mustakim Sarkar
    * @Date_Created 05-07-2023
    * @Date_Modified  
    * @function async
    * @functionName addonDetails
    * @functionPurpose  for getting addons details
    *                                                   
    * @functionParam req, res
    *
    * @functionSuccess API response 
    *
    * @functionError {Boolean} error error is there.
    */
let addonDetails = async (req, res) => {
    try {
        //console.log("Add Ons Add:==================>");
        if (!(req.body.product_category_id)) {
            let apiResponse = response.generate(1, ` Please fill all mandatory fields`, null);
            res.status(400);
            return res.send(apiResponse);
        }
        let details = await addonModel.find({ $and: [{ product_category_id: req.body.product_category_id }, { vendor_id: mongoose.Types.ObjectId(req.user.vendor_id) }] })

        let apiResponse = response.generate(0, ` Successfully updated`, details);
        res.status(200);
        res.send(apiResponse);

    } catch (err) {
        let apiResponse = response.generate(1, ` Something went wrong`, null);
        res.status(412);
        res.send(apiResponse);
    }
}

module.exports = {
    addOnCreate: addOnCreate,
    addonDetails: addonDetails

}
