const adminController = require("../../../controllers/backend/adminController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/admin/login`, validator.adminLoginValidate, adminController.adminLogin);
    app.post(`${baseUrl}/admin/create`, validator.adminCreateValidate, adminController.adminCreate);
    app.post(`${baseUrl}/admin/createmodule`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.adminCreateModule);
    app.get(`${baseUrl}/admin/listmodule`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.adminListModule);
    app.post(`${baseUrl}/admin/listsubadminmodule`, auth.isAuthorized, validauth.isAdminAuthorized, validator.listsubadminmoduleValidate, adminController.listsubadminmodule);
    app.post(`${baseUrl}/admin/assignmodule`, auth.isAuthorized, validauth.isAdminAuthorized, validator.assignModuleValidate, adminController.assignModule);
    app.get(`${baseUrl}/admin/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.adminDeatils);
    app.get(`${baseUrl}/admin/subadmin-list`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.subadminlist);
    app.get(`${baseUrl}/admin/subadmin-search`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.subadminSearch);
    app.post(`${baseUrl}/admin/subadmin-details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.subadmindetailsValidate, adminController.subadminDeatils);
    app.post(`${baseUrl}/admin/subadmin-update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.subadminupdateValidate, adminController.subadminupdate);
    app.post(`${baseUrl}/admin/settingsCreate`, auth.isAuthorized, validauth.isAdminAuthorized, validator.createSettingValidate, adminController.addSetting);
    app.get(`${baseUrl}/admin/settingsDetails`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.detailsSetting);
    app.post(`${baseUrl}/admin/settingsUpdate`, auth.isAuthorized, validauth.isAdminAuthorized, validator.updateSettingValidate, adminController.updateSetting);
    app.post(`${baseUrl}/admin/dashboardfilter`, auth.isAuthorized, validauth.isAdminAuthorized, validator.dashboardfilterValidate, adminController.dashboardfilter);
    app.post(`${baseUrl}/admin/forgotpassword`, validator.adminForgotPasswordValidate, adminController.adminForgotPassword);
    app.post(`${baseUrl}/admin/changePassword`, auth.isAuthorized, validauth.isAdminAuthorized, validator.adminChangePasswordValidate, adminController.adminChangePassword);
    app.post(`${baseUrl}/admin/checkSamePassword`, auth.isAuthorized, validauth.isAdminAuthorized, validator.checkSamePasswordValidate, adminController.checkSamePasswordAdmin);
    app.post(`${baseUrl}/admin/orderUpdate`, auth.isAuthorized, validauth.isAdminAuthorized, validator.vendorOrderUpdateValidate, adminController.adminOrderUpdate);
    app.post(`${baseUrl}/admin/orderDetails`, auth.isAuthorized, validauth.isAdminAuthorized, validator.vendorOrderDetailsValidate, adminController.adminOrderDetails);
    app.post(`${baseUrl}/admin/shippingTex`, auth.isAuthorized, validauth.isAdminAuthorized, validator.shippingTaxValidate, adminController.adminshippingTax);
    app.get(`${baseUrl}/getShippingDeatils`, auth.isAuthorized, adminController.adminVendorshippingTax);
    app.post(`${baseUrl}/admin/commissionSetup`, auth.isAuthorized, validauth.isAdminAuthorized, validator.commissionSetupValidate, adminController.commissionSetup);
    app.get(`${baseUrl}/admin/getCommissionDeatils`, auth.isAuthorized, adminController.getCommissionDeatils);

    app.post(`${baseUrl}/admin/returnDuration`, auth.isAuthorized, validauth.isAdminAuthorized, validator.returnDurationValidate, adminController.adminReturnDuration);
    app.get(`${baseUrl}/getReturnDuration`, auth.isAuthorized, adminController.getReturnDuration);
    app.get(`${baseUrl}/admin/returnOrderList`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.adminReturnOrderList);

    app.post(`${baseUrl}/admin/coupons/add`, auth.isAuthorized, validauth.isAdminAuthorized, validator.couponAddValidate, adminController.adminCouponAdd);
    app.get(`${baseUrl}/admin/coupons/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.adminCouponList);
    app.post(`${baseUrl}/admin/coupons/statusChange`, auth.isAuthorized, validauth.isAdminAuthorized, validator.couponStatusChangeValidate, adminController.CouponStatusChange);
    app.post(`${baseUrl}/admin/coupons/websiteViewChange`, auth.isAuthorized, validauth.isAdminAuthorized, validator.couponWebsiteViewStatusChangeValidate, adminController.CouponwebsiteViewStatusChange);
    app.post(`${baseUrl}/admin/coupons/update/:id`, auth.isAuthorized, validauth.isAdminAuthorized, validator.couponUpdateValidate, adminController.adminCouponUpdate);
    app.post(`${baseUrl}/admin/coupons/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.couponDetailsValidate, adminController.couponDetails);
    app.get(`${baseUrl}/admin/coupons/search`, auth.isAuthorized, validauth.isAdminAuthorized, adminController.couponSearchList)

}