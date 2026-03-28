const varientController = require("../../controllers/frontend/varientController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/varient/list`, varientController.varientList);
    app.post(`${baseUrl}/varient/add`, varientController.varientCreate);
}