const cartController = require("../../controllers/frontend/cartController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");
const validauth = require("../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/cart/list`, auth.isAuthorized, validauth.isUserAuthorized, cartController.listCart);
    // app.post(`${baseUrl}/cart/add`, auth.isAuthorized, validauth.isUserAuthorized, validator.cartValidate, cartController.addCart);
    app.post(`${baseUrl}/cart/bulkadd`, auth.isAuthorized, validauth.isUserAuthorized, validator.bulkcartValidate, cartController.addCartBulk);
    app.post(`${baseUrl}/cart/delete`, auth.isAuthorized, validauth.isUserAuthorized, validator.deleteCartValidate, cartController.deleteCart);


    // Check return eligibility
    // app.get(`${baseUrl}/returns/eligible/:orderId`, auth.isAuthorized, validauth.isUserAuthorized, cartController.checkReturnEligibility);
    app.get(`${baseUrl}/returns/eligible/:orderId`, auth.isAuthorized, validauth.isUserAuthorized,cartController.checkReturnEligibility);
    app.post(`${baseUrl}/return/submit`, auth.isAuthorized, validauth.isUserAuthorized, validator.returnSubmitValidate, cartController.returnSubmit);



}