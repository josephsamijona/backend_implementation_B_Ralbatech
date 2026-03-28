const mediaTextContentController = require("../../../controllers/backend/mediaTextContentController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;
    app.get(`${baseUrl}/vendor/media-text-content/list`, auth.isAuthorized, mediaTextContentController.mediaTextContentList);
    app.post(`${baseUrl}/vendor/media-text-content/imageupload`, auth.isAuthorized, validauth.isVendorAuthorized, fileUpload.mediaTextContentupload.fields([{ name: 'image', maxCount: 1 }]), mediaTextContentController.uploadFiles);
    app.post(`${baseUrl}/vendor/media-text-content/details`, auth.isAuthorized, validauth.isVendorAuthorized, validator.mediaTextContentDetailsValidate, mediaTextContentController.mediaTextContentDetails);
    app.post(`${baseUrl}/vendor/media-text-content/update`, auth.isAuthorized, validauth.isVendorAuthorized, validator.updateMediaTextContentValidate, mediaTextContentController.updateMediaTextContent);
    app.post(`${baseUrl}/vendor/media-text-content-change-position`, auth.isAuthorized, mediaTextContentController.mediaTextContentChangePosition);
    app.get(`${baseUrl}/vendor/tag/list`, auth.isAuthorized, validauth.isVendorAuthorized, mediaTextContentController.tagList);
}