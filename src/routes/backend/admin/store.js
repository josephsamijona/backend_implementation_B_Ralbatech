const storeController = require("../../../controllers/backend/adminStoreController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/admin/store/list`, auth.isAuthorized, validauth.isAdminAuthorized, validator.storeValidate, storeController.storeList);
    app.post(`${baseUrl}/admin/store/imageupload`, fileUpload.storeupload.fields([{ name: 'image', maxCount: 1 }]), storeController.uploadFiles);
    app.post(`${baseUrl}/admin/store/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.storeDetailsValidate, storeController.storeDetails);
    app.post(`${baseUrl}/admin/store/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.storeUpdateValidate, storeController.storeUpdate);
    app.post(`${baseUrl}/admin/store/delete`, auth.isAuthorized, validauth.isAdminAuthorized, validator.storeDeleteValidate, storeController.storeDelete);
    app.post(`${baseUrl}/admin/store/statuschange`, auth.isAuthorized, validauth.isAdminAuthorized, validator.storeUpdateValidate, storeController.storeUpdate);

    app.post(`${baseUrl}/vendor-admin/login`, validator.vendoradminLoginValidate, storeController.vendoradminLogin);
    app.get(`${baseUrl}/vendor-admin/details`, auth.isAuthorized,  storeController.vendorAdminDetails);
}