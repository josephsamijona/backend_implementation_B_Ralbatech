const generalController = require("../controllers/generalController");
const appConfig = require("../../config/appConfig");
const auth = require("../middlewares/auth");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/generate-api-key`,generalController.generateAPIKey);

}