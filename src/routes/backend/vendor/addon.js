
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");
const addonController = require("../../../controllers/backend/addonController");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/vender/addon/create`, auth.isAuthorized, addonController.addOnCreate);
    app.post(`${baseUrl}/vender/addon/details`, auth.isAuthorized, addonController.addonDetails);

}