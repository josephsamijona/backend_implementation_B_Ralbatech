const mtgController = require("../../controllers/frontend/mtgController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validauth = require("../../middlewares/userValidate");

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}`;

    // Liste tous les MTGs de la plateforme avec statut 'active'
    // Utilisé par le Vendor Portal pour choisir un MTG existant
    app.get(`${baseUrl}/mtg/platform-list`, auth.isAuthorized, mtgController.getPlatformMTGList);

    // Crée un nouveau MTG (vendor) → statut 'pending' jusqu'à approbation admin
    app.post(`${baseUrl}/mtg/vendor/create`, auth.isAuthorized, validauth.isVendorAuthorized, mtgController.createVendorMTG);

    // Ajoute un MTG existant de la plateforme à la landing page du vendor
    app.post(`${baseUrl}/mtg/vendor/add-to-store`, auth.isAuthorized, validauth.isVendorAuthorized, mtgController.addMTGToVendorStore);

    // Liste les MTGs de la landing page d'un vendor spécifique (pour le store web portal)
    app.post(`${baseUrl}/mtg/vendor/store-landing-list`, mtgController.getVendorStoreLandingMTGs);
};
