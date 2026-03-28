const bannerController = require("../../controllers/frontend/bannerController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/banner/list`, bannerController.homeBannerlist);
    app.get(`${baseUrl}/vendorlist`, bannerController.allvendorlist);
    app.post(`${baseUrl}/vendorbanner/list`, validator.vendorbannerValidate, bannerController.homeVendorBannerlist);
}