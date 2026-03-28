const paymentController = require("../controllers/frontend/paymentController");
const appConfig = require("../../config/appConfig");
const auth = require("../middlewares/auth");
const validauth = require("../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/create-order`, auth.isAuthorized, validauth.isUserAuthorized, paymentController.createOrder);

    app.post(`${baseUrl}/complete-order`, auth.isAuthorized, validauth.isUserAuthorized, paymentController.completeOrder);

}