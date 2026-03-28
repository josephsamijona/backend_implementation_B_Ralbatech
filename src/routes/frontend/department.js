const departmentController = require("../../controllers/frontend/departmentController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/department`, departmentController.departmentList);
    app.post(`${baseUrl}/department/details`,validator.departmentDetailsValidate, departmentController.departmentDetails);
}