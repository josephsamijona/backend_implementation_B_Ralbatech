const orderController = require("../../../controllers/backend/orderController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/vendor/orderList`, auth.isAuthorized, validauth.isVendorAuthorized, orderController.vendorOrderList);
    app.get(`${baseUrl}/vendor/returnOrderList`, auth.isAuthorized, validauth.isVendorAuthorized, orderController.vendorReturnOrderList);
    app.get(`${baseUrl}/vendor/orderSearch`, auth.isAuthorized, validauth.isVendorAuthorized, orderController.vendorOrderSearch);
    app.post(`${baseUrl}/vendor/orderUpdate`, auth.isAuthorized, validauth.isVendorAuthorized, validator.vendorOrderUpdateValidate, orderController.vendorOrderUpdate);
    app.post(`${baseUrl}/vendor/orderDetails`, auth.isAuthorized, validauth.isVendorAuthorized, validator.vendorOrderDetailsValidate, orderController.vendorOrderDetails);
    app.post(`${baseUrl}/vendor/addonPrescriptionData/:id`, auth.isAuthorized, validauth.isVendorAuthorized, orderController.vendorOrderDetailsUpdatePrescription);

}