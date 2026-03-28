const adminVendorController = require("../../../controllers/backend/adminVendorController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const adminValidator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/admin/vendor/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.vendorList);
    app.get(`${baseUrl}/admin/vendor/search`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.searchVendorList);
    app.post(`${baseUrl}/admin/vendor/create`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminCreateVendorValidate, adminVendorController.vendorCreate);
    app.post(`${baseUrl}/admin/vendor/imageUpload`, fileUpload.vendorDP.fields([{ name: 'image', maxCount: 1 }]), adminVendorController.uploadVendordp);
    app.post(`${baseUrl}/admin/vendor/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminDetailsVendorValidate, adminVendorController.vendorDetails);
    app.post(`${baseUrl}/admin/vendor/update`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminUpdateVendorValidate, adminVendorController.vendorUpdate);
    app.post(`${baseUrl}/admin/vendor/statusChange`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendorStatusValidate, adminVendorController.vendorUpdate);
    app.post(`${baseUrl}/admin/vendor/store/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendorstoreValidate, adminVendorController.adminVendorStoreList);
    app.post(`${baseUrl}/admin/vendor/store/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminstoreDetailsValidate, adminVendorController.adminstoreDetails);
    app.post(`${baseUrl}/admin/vendor/department/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendordepartmentValidate, adminVendorController.adminVendorDepartmentList);
    app.post(`${baseUrl}/admin/vendor/department/details`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.admindepartmentDetailsValidate, adminVendorController.adminVendorDepartmentDetails);
    app.post(`${baseUrl}/admin/vendor/room/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendorRoomValidate, adminVendorController.adminVendorRoomList);
    app.get(`${baseUrl}/admin/vendor/product/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.adminVendorProductList);
    app.get(`${baseUrl}/admin/vender/product/search`, auth.isAuthorized, adminVendorController.adminVendorProductSearch);
    app.get(`${baseUrl}/admin/vendor/tryon-product/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.adminVendorTryonProductList);
    app.get(`${baseUrl}/admin/access-vendor/pending-list`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.pendingProductList);
    app.get(`${baseUrl}/admin/access-vendor/approve-list`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.approveProductList);
    app.post(`${baseUrl}/admin/vender/product/update`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.adminVendorProductUpdate);
    app.post(`${baseUrl}/admin/access-vendor/product-activation`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.productActivationValidate, adminVendorController.productActivation);
    app.post(`${baseUrl}/admin/vender/product/statusChange`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.vendorProductStatusChangeValidate, adminVendorController.adminVendorProductStatusChange);
    app.post(`${baseUrl}/admin/vender/product/bulkstatusChange`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.vendorBulkProductStatusChangeValidate, adminVendorController.adminBulkVendorProductStatusChange);
    app.post(`${baseUrl}/admin/vender/product/delete`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.vendorProductDeleteValidate, adminVendorController.adminVendorProductDelete);
    app.post(`${baseUrl}/admin/vendor/orderList`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendorOrderListValidate, adminVendorController.adminvendorOrderList);
     app.get(`${baseUrl}/admin/vendor/orderSearch`, auth.isAuthorized, validauth.isAdminAuthorized, adminVendorController.adminvendorOrderSearch);
    app.post(`${baseUrl}/admin/vendor/orderUpdate`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminvendorOrderUpdateValidate, adminVendorController.adminvendorOrderUpdate);
    app.post(`${baseUrl}/admin/vendor/orderDetails`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminVendorOrderDetailsValidate, adminVendorController.adminvendorOrderDetails);
    app.post(`${baseUrl}/admin/vendor/banner/statuschange`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.bannerStatusChangeValidate, adminVendorController.bannerStatusChange);
    app.post(`${baseUrl}/admin/vendor/banner/list`, auth.isAuthorized, validauth.isAdminAuthorized, adminValidator.adminbannerlistValidate, adminVendorController.bannerList);
}