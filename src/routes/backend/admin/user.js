const adminUserController = require("../../../controllers/backend/adminUserController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const adminValidator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/admin/user/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminUserController.userList)
    app.get(`${baseUrl}/admin/user/search`, auth.isAuthorized, validauth.isAdminAuthorized, adminUserController.userSearchList)
    app.post(`${baseUrl}/admin/user/imageUpload`,  fileUpload.userDP.fields([{ name: 'image', maxCount: 1 }]), adminUserController.uploadUserrdp);
    app.post(`${baseUrl}/admin/user/create`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminCreateUserValidate, adminUserController.userCreate);
    app.post(`${baseUrl}/admin/user/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminDetailsUserValidate, adminUserController.userDetails);
    app.post(`${baseUrl}/admin/user/update`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUpdateUserValidate, adminUserController.userUpdate);
    app.post(`${baseUrl}/admin/user/statusChange`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUpdateUserValidate, adminUserController.userUpdate);
    app.post(`${baseUrl}/admin/user/orderList`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUserOrderListValidate, adminUserController.adminUserOrderList);
    app.post(`${baseUrl}/admin/user/orderDetails`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUserOrderDetailsValidate, adminUserController.adminUserOrderDetails);
    app.post(`${baseUrl}/admin/user/coupons/usageUsers`, auth.isAuthorized, validauth.isAdminAuthorized, adminUserController.getCouponUsageUsers);
    app.post(`${baseUrl}/admin/user/getCouponByOrderId`, auth.isAuthorized, validauth.isAdminAuthorized, adminUserController.getCouponByOrderId);


}