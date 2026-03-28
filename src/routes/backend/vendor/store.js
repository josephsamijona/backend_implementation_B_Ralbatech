const storeController = require("../../../controllers/backend/storeController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/vender/store/list`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeValidate, storeController.storeList);
    app.post(`${baseUrl}/vendor/store/imageupload`, fileUpload.storeupload.fields([{ name: 'image', maxCount: 1 }]), storeController.uploadFiles);
    app.post(`${baseUrl}/vendor/store/jpg-imageupload`, fileUpload.jpgstoreupload.fields([{ name: 'image', maxCount: 1 }]), storeController.uploadFiles);
    app.post(`${baseUrl}/vendor/store/logo-imageupload`, fileUpload.logoupload.fields([{ name: 'image', maxCount: 1 }]), storeController.uploadFiles);
    app.post(`${baseUrl}/vendor/store/create`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeAddValidate, storeController.storeCreate);
    app.post(`${baseUrl}/vender/store/details`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeDetailsValidate, storeController.storeDetails);
    app.post(`${baseUrl}/vender/store/update`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeUpdateValidate, storeController.storeUpdate);
    app.post(`${baseUrl}/vender/store/delete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeDeleteValidate, storeController.storeDelete);
    app.post(`${baseUrl}/vender/store/imagedelete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.storeImageDeleteValidate, storeController.storeImageDelete);
    app.post(`${baseUrl}/vender/store/product-update`,validator.storeProductUpdateValidate, storeController.storeProductUpdate);
    app.post(`${baseUrl}/vender/store/duplicate`,auth.isAuthorized,validator.storeDuplicateValidate, storeController.storeDuplicate);
}