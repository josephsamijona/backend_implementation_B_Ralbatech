const reviewsController = require("../../controllers/frontend/reviewsController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validauth = require("../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;

    // Reviews d'un vendor (optionnellement filtrees par produit) - public read
    app.get(`${baseUrl}/reviews/vendor/:vendor_id`, reviewsController.getVendorReviews);

    // Creer une review (user authentifie)
    app.post(`${baseUrl}/reviews/create`, auth.isAuthorized, validauth.isUserAuthorized, reviewsController.createReview);
};