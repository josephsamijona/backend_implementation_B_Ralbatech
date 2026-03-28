const brandController = require("../../../controllers/backend/adminBrandController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;
    app.get(`${baseUrl}/admin/brand/list`, auth.isAuthorized, brandController.brandList);
    app.get(`${baseUrl}/admin/brand/search`, auth.isAuthorized, brandController.searchBrandList);
    app.post(`${baseUrl}/admin/brand/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.brandAddValidate, brandController.brandCreate);
    app.post(`${baseUrl}/admin/brand/imageupload`,auth.isAuthorized, validauth.isAdminAuthorized, fileUpload.brandupload.fields([{ name: 'image', maxCount: 1 }]), brandController.uploadFiles);
    app.post(`${baseUrl}/admin/brand/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.brandDetailsValidate, brandController.brandDetails);
    app.post(`${baseUrl}/admin/brand/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.brandUpdateValidate, brandController.brandUpdate);
}