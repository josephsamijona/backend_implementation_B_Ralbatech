const bannerController = require("../../../controllers/backend/vendorBannerController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;
    
    app.get(`${baseUrl}/vandor/brand/list`, auth.isAuthorized, validauth.isVendorAuthorized, bannerController.brandList);
    app.get(`${baseUrl}/vendor/all-subcategory`, auth.isAuthorized, validauth.isVendorAuthorized, bannerController.subcategoryList);
    app.get(`${baseUrl}/vendor/banner/list`, auth.isAuthorized, validauth.isVendorAuthorized, bannerController.bannerList);
    app.post(`${baseUrl}/vendor/banner/imageupload`,  fileUpload.VendorBanner.fields([{ name: 'image', maxCount: 1 }]), bannerController.uploadFiles);
    app.post(`${baseUrl}/vendor/banner/create`, auth.isAuthorized, validauth.isVendorAuthorized, validator.bannerCreateValidate, bannerController.bannerCreate);
    app.post(`${baseUrl}/vendor/banner/details`, auth.isAuthorized, validauth.isVendorAuthorized, validator.bannerDetailsValidate, bannerController.bannerDetails);
    app.post(`${baseUrl}/vendor/banner/update`, auth.isAuthorized, validauth.isVendorAuthorized, validator.bannerUpdateValidate, bannerController.bannerUpdate);
    app.post(`${baseUrl}/vendor/banner/delete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.bannerDeleteValidate, bannerController.bannerDelete);

}