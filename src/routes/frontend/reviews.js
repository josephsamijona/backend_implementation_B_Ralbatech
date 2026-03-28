const reviewsController = require("../../controllers/frontend/reviewsController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;

    // Reviews d'un vendor (optionnellement filtrées par produit)
    app.get(`${baseUrl}/reviews/vendor/:vendor_id`, auth.isAuthorized, reviewsController.getVendorReviews);

    // Créer une review
    app.post(`${baseUrl}/reviews/create`, auth.isAuthorized, reviewsController.createReview);
};
