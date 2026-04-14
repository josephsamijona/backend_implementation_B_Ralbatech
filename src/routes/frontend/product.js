const productController = require("../../controllers/frontend/productController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validauth = require("../../middlewares/userValidate");
const validator = require("../../middlewares/frontend/validator");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/product/list`, productController.productList);
    app.get(`${baseUrl}/product/:slug`, productController.productDetails);
    app.post(`${baseUrl}/productsearch`, validator.searchValidate, productController.productSearch);
    app.get(`${baseUrl}/settings`, productController.settingsDetaild);
    app.post(`${baseUrl}/allproductsearch`, validator.searchValidate, productController.allproductSearch);
    app.post(`${baseUrl}/filter-store-product`, validator.filterStoreProductValidate, productController.filterStoreProduct);
    app.post(`${baseUrl}/home-filter-store-product`, validator.homefilterStoreProductValidate, productController.homefilterStoreProduct);
    app.post(`${baseUrl}/filter-contact-product`, validator.filterStoreProductValidate, productController.filterContactProduct);
    app.post(`${baseUrl}/filter-all-store-product`, validator.filterStoreProductValidate, productController.filterAllStoreProduct);

    // === Multi-Store Portal: Displayer-Fulfiller routes ===

    // Liste tous les produits de la plateforme (vue vendor) avec infos displayer/fulfiller
    app.post(`${baseUrl}/products/platform-all`, auth.isAuthorized, validauth.isVendorAuthorized, productController.getPlatformAllProducts);

    // Met a jour le statut displayer/fulfiller d'un vendor pour un produit
    app.patch(`${baseUrl}/products/:product_id/displayer-fulfiller`, auth.isAuthorized, validauth.isVendorAuthorized, productController.updateDisplayerFulfiller);
    // Compat legacy
    app.post(`${baseUrl}/products/:product_id/displayer-fulfiller`, auth.isAuthorized, validauth.isVendorAuthorized, productController.updateDisplayerFulfiller);

    // Retourne la liste des fulfillers actifs pour un produit (vue web portal) - public read
    app.get(`${baseUrl}/products/:product_id/fulfillers`, productController.getProductFulfillers);
}