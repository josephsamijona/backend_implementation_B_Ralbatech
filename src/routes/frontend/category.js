const categoryController = require("../../controllers/frontend/categoryController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/category`, categoryController.categoryList);
    app.post(`${baseUrl}/category/create`, categoryController.categoryCreate);
}