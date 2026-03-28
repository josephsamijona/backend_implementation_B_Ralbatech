const productController = require("../../../controllers/backend/productController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/vender/product/imageupload`, fileUpload.upload.fields([{ name: 'image', maxCount: 1 }]), productController.uploadFiles);
    app.post(`${baseUrl}/vender/product/glbupload`, fileUpload.uploadglb.fields([{ name: 'image', maxCount: 1 }]), productController.uploadFiles);
    app.post(`${baseUrl}/vender/product/create`, auth.isAuthorized, validauth.isVendorAuthorized, productController.productCreate);
    app.get(`${baseUrl}/vender/product/search/`, auth.isAuthorized, productController.productSearch);
    app.get(`${baseUrl}/vender/product/list`, auth.isAuthorized, validauth.isVendorAuthorized, productController.productList);
    app.get(`${baseUrl}/access-vendor/pending-list`, auth.isAuthorized, validauth.isVendorAuthorized, productController.pendingProductList);
    app.get(`${baseUrl}/access-vendor/approve-list`, auth.isAuthorized, validauth.isVendorAuthorized, productController.approveProductList);
    app.post(`${baseUrl}/access-vendor/product-activation`, auth.isAuthorized, validauth.isVendorAuthorized, validator.productActivationValidate, productController.productActivation);
    app.get(`${baseUrl}/vender/product/:slug`, auth.isAuthorized, productController.productDetails);
    app.post(`${baseUrl}/vender/product/update`, auth.isAuthorized, validauth.isVendorAuthorized, productController.productUpdate);
    app.post(`${baseUrl}/vender/product/delete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.vendorProductDeleteValidate, productController.productDelete);
    app.post(`${baseUrl}/vender/product/image-delete`, auth.isAuthorized, validator.vendorProductIMageDeleteValidate, productController.productImageDelete);
    app.post(`${baseUrl}/vender/product/image-delete-server`, auth.isAuthorized, validator.vendorProductIMageDeleteServerValidate, productController.productImageDeleteServer);
    app.post(`${baseUrl}/vender/product/skucheck`, auth.isAuthorized, validator.vendorProductSKUcheckValidate, productController.productSKUcheck);
    app.get(`${baseUrl}/vender/product-library`, auth.isAuthorized, validauth.isVendorAuthorized, productController.productLibrary); // needed right now
    app.get(`${baseUrl}/vender/product-copy-form-library`, auth.isAuthorized, validauth.isVendorAuthorized, productController.productCopyFromLibrary);
    app.get(`${baseUrl}/vender/tag/list`, auth.isAuthorized, validauth.isVendorAuthorized, productController.tagList);
}