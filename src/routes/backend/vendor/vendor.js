const adminController = require("../../../controllers/backend/adminController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/vendor/generateOTP`, validator.generateOTPValidate, adminController.vendorgenerateOtp);
    app.post(`${baseUrl}/vendor/signup`, validator.vendorSignupValidate, adminController.vendorSignup);
    app.post(`${baseUrl}/vendor/login`, validator.vendorLoginValidate, adminController.vendorLogin);
    app.get(`${baseUrl}/vendor/details`, auth.isAuthorized, validauth.isVendorAuthorized, adminController.vendorDeatils);
    app.post(`${baseUrl}/vendor/dashboardfilter`, auth.isAuthorized, validauth.isVendorAuthorized, validator.vendorDashboardValidate, adminController.vendorDashboardFilter);
    app.post(`${baseUrl}/vendor/forgotpassword`, validator.vendorForgotPasswordValidate, adminController.vendorForgotPassword);
    app.post(`${baseUrl}/vendor/checkSamePassword`, auth.isAuthorized, validauth.isVendorAuthorized, validator.checkSamePasswordValidate, adminController.checkSamePasswordVendor);
    app.post(`${baseUrl}/vendor/changePassword`, auth.isAuthorized, validauth.isVendorAuthorized, validator.vendorChangePasswordValidate, adminController.vendorChangePassword);
    app.post(`${baseUrl}/vendor/shippingTex`, auth.isAuthorized, validauth.isVendorAuthorized, validator.shippingTaxValidate, adminController.vendorshippingTax);
    app.get(`${baseUrl}/vendor/copy-vendor-list`, adminController.copyVendorlist);
    app.post(`${baseUrl}/request-for-3d-asset`,auth.isAuthorized, adminController.requestFor3dAsset);
}