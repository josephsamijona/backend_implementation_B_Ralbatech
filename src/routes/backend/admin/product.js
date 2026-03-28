const productController = require("../../../controllers/backend/productController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validauth = require("../../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;

    // === Multi-Store Portal: Admin Displayer-Fulfiller approval routes ===

    // Liste tous les displayer-fulfiller en attente d'approbation
    app.get(`${baseUrl}/admin/products/displayer-fulfiller/pending`, auth.isAuthorized, validauth.isAdminAuthorized, productController.getPendingDisplayerFulfillers);

    // Approuver/rejeter le statut displayer-fulfiller d'un vendor pour un produit
    app.post(`${baseUrl}/admin/products/:product_id/displayer-fulfiller/:vendor_id`, auth.isAuthorized, validauth.isAdminAuthorized, productController.updateDisplayerFulfillerStatus);
};
