const storeController = require("../../controllers/frontend/storeController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/stores`, validator.storeValidate, storeController.storeList);
    //app.post(`${baseUrl}/stores/create`, storeController.storeCreate);
    app.post(`${baseUrl}/stores/configuration`, validator.storeConfigValidate, storeController.configurationList);
    app.post(`${baseUrl}/stores/product3dlist`, validator.storeConfigValidate, storeController.product3dlist);
    app.post(`${baseUrl}/stores/roomconfiguration`, validator.storeConfigValidate, storeController.roomconfigurationList);
    app.post(`${baseUrl}/stores/storeview`, validator.storeViewValidate, storeController.storeViewCount);
    app.post(`${baseUrl}/user/vendor-roomcheck`, validator.roomVendorValidate, storeController.vendorRoomCheck);
    app.post(`${baseUrl}/stores/details`, validator.storeDetailsValidate, storeController.storeDetails);
    app.post(`${baseUrl}/stores/vendor-store-details`, validator.vendorstoreDetailsValidate, storeController.vendorstoreDetails);
    app.post(`${baseUrl}/stores/product-3d-list-by-vendor`, validator.storeConfigVendorValidate, storeController.product3dlistVendor);
    app.post(`${baseUrl}/stores/all-product-3d-list-by-vendor`, validator.storeConfigVendorValidate, storeController.product3dlistAllVendor);
    app.post(`${baseUrl}/stores/all-product-3d-list-by-vendor-for-user`, validator.storeConfigVendorValidate, storeController.product3dlistAllVendorForUser);
    app.post(`${baseUrl}/stores/all-product-2d-list-by-vendor-for-user`, validator.storeConfigVendorByUserValidate, storeController.product2dlistAllVendorForUser);
    app.get(`${baseUrl}/category-list-for-store`, storeController.categoryList);
    app.get(`${baseUrl}/eyeglass-category-list-for-store`, storeController.eyeglascategoryList);
    app.get(`${baseUrl}/brand/list`, storeController.brandList);
    app.get(`${baseUrl}/home-page-brand/list`, storeController.homePageBrandList);
    app.get(`${baseUrl}/3d-product-brand/list`, storeController.brand3dList);
    app.get(`${baseUrl}/2d-product-brand/list`, storeController.brand2dList);
    app.get(`${baseUrl}/2d-3d-product-brand/list`, storeController.brand2d3dList);
    app.get(`${baseUrl}/contact-product-brand/list`, storeController.brandcontactList);
    app.get(`${baseUrl}/tag-list`, storeController.tagList);
    app.get(`${baseUrl}/media-text-contain-list`, storeController.mediaTextContainList);
}