const adminMediaTextContentController = require("../../../controllers/backend/adminMediaTextContentController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;
    app.get(`${baseUrl}/admin/media-text-content/list`, auth.isAuthorized, adminMediaTextContentController.mediaTextContentList);
    app.post(`${baseUrl}/admin/media-text-content/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.addMediaTextContentValidate, adminMediaTextContentController.createMediaTextContent);
    app.post(`${baseUrl}/admin/media-text-content/imageupload`, auth.isAuthorized, validauth.isAdminAuthorized, fileUpload.mediaTextContentupload.fields([{ name: 'image', maxCount: 1 }]), adminMediaTextContentController.uploadFiles);
    app.post(`${baseUrl}/admin/media-text-content/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.mediaTextContentDetailsValidate, adminMediaTextContentController.mediaTextContentDetails);
    app.post(`${baseUrl}/admin/media-text-content/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.updateMediaTextContentValidate, adminMediaTextContentController.updateMediaTextContent);
    app.post(`${baseUrl}/admin/media-text-content-change-position`, auth.isAuthorized, adminMediaTextContentController.mediaTextContentChangePosition);
    app.get(`${baseUrl}/admin/tag/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminMediaTextContentController.tagList);

    // === Multi-Store Portal: MTG approval routes ===

    // Liste les MTGs en attente d'approbation
    app.get(`${baseUrl}/admin/mtg/pending`, auth.isAuthorized, validauth.isAdminAuthorized, adminMediaTextContentController.getPendingMTGs);

    // Changer le statut d'un MTG (pending -> active ou inactive)
    app.patch(`${baseUrl}/admin/mtg/:mtg_id/status`, auth.isAuthorized, validauth.isAdminAuthorized, adminMediaTextContentController.updateMTGStatus);
    // Compat legacy
    app.post(`${baseUrl}/admin/mtg/:mtg_id/status`, auth.isAuthorized, validauth.isAdminAuthorized, adminMediaTextContentController.updateMTGStatus);
}