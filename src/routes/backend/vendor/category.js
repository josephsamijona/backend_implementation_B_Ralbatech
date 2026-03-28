const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const validauth = require("../../../middlewares/userValidate");
const CategoryController = require("../../../controllers/backend/categoryController");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;
    app.post(`${baseUrl}/vendor/sub-category/create`, auth.isAuthorized, validauth.isVendorAuthorized,validator.SubCategoryCreateValidate, CategoryController.createSubCategory);
    app.post(`${baseUrl}/vendor/sub-category-list`, auth.isAuthorized, validauth.isVendorAuthorized, CategoryController.SubcategoryList);
    app.post(`${baseUrl}/vendor/child-sub-category/create`, auth.isAuthorized, validauth.isVendorAuthorized,validator.ChildCategoryCreateValidate,CategoryController.createChildSubCategory);
    app.post(`${baseUrl}/vendor/child-sub-category-list`,auth.isAuthorized, validauth.isVendorAuthorized, CategoryController.ChildSubcategoryList);

    app.get(`${baseUrl}/vendor/category-list`, auth.isAuthorized, CategoryController.categoryList);
    app.post(`${baseUrl}/vendor/category-details`, auth.isAuthorized, CategoryController.categoryDetails);
}