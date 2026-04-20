const reviewsController = require("../../controllers/frontend/reviewsController");
const appConfig = require("../../../config/appConfig");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;

    // Reviews d'un vendor (optionnellement filtrees par produit) - public read
    app.get(`${baseUrl}/reviews/vendor/:vendor_id`, reviewsController.getVendorReviews);

    // Creer une review (guest or user)
    app.post(`${baseUrl}/reviews/create`, reviewsController.createReview);
};
