const tagController = require("../../../controllers/backend/adminTagController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;
    app.get(`${baseUrl}/admin/tag/list`, auth.isAuthorized, tagController.tagList);
    app.post(`${baseUrl}/admin/tag/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.addTagValidate, tagController.createTag);
    app.post(`${baseUrl}/admin/tag/imageupload`,auth.isAuthorized, validauth.isAdminAuthorized, fileUpload.tagupload.fields([{ name: 'image', maxCount: 1 }]), tagController.uploadFiles);
    app.post(`${baseUrl}/admin/tag/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.tagDetailsValidate, tagController.tagDetails);
    app.post(`${baseUrl}/admin/tag/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.updateTagValidate, tagController.updateTag);
}