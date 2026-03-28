const adminImageInstController = require("../../../controllers/backend/adminImageInstController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const adminValidator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");

const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/admin/imageinst/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminImageInstController.imageInstList)
    app.post(`${baseUrl}/admin/imageinst/create`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminCreateImageInstValidate, adminImageInstController.imageInstCreate);
    app.post(`${baseUrl}/admin/imageinst/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminDetailsImageInstValidate, adminImageInstController.imageInstDetails);
    app.post(`${baseUrl}/admin/imageinst/update`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUpdateImageInstValidate, adminImageInstController.imageInstUpdate);



}