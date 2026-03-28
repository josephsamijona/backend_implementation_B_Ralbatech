
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
//const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");
const fileUpload = require("../../../middlewares/fileUpload");
const adminCategoryController = require("../../../controllers/backend/adminCategoryController");

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;
    // only Create category with addons and attribute
    app.post(`${baseUrl}/admin/category/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.CategoryCreateValidate, adminCategoryController.createCategory);
    app.get(`${baseUrl}/admin/category-list`, auth.isAuthorized, validauth.isAdminAuthorized, adminCategoryController.categoryList);
    app.get(`${baseUrl}/admin/search-category`, auth.isAuthorized, validauth.isAdminAuthorized, adminCategoryController.searchCategoryList);
    // only update category with addons and attribute
    app.post(`${baseUrl}/admin/category/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.CategoryUpdateValidate, adminCategoryController.updateCategory);
    app.post(`${baseUrl}/admin/category/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.catagoryDetailsValidate, adminCategoryController.catagoriesDetails);
    // only Delete category with addons and attribute
    app.post(`${baseUrl}/admin/category/delete`, auth.isAuthorized, validauth.isAdminAuthorized,validator.CategoryDeleteValidate,adminCategoryController.categoryDelete );
    // only create sub categories
    app.post(`${baseUrl}/admin/sub-category/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.SubCategoryCreateValidate, adminCategoryController.createSubCategory);
    app.post(`${baseUrl}/admin/sub-category-list`, auth.isAuthorized, validauth.isAdminAuthorized, adminCategoryController.SubcategoryList);
    // only update sub categories
    app.post(`${baseUrl}/admin/sub-category/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.SubCategoryUpdateValidate, adminCategoryController.updateSubCategory);
    app.post(`${baseUrl}/admin/sub-category/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.subcatagoryDetailsValidate, adminCategoryController.subcatagoriesDetails);
      // only delete sub categories
    app.post(`${baseUrl}/admin/sub-category/delete`, auth.isAuthorized, validauth.isAdminAuthorized,validator.subCategoryDeleteValidate ,adminCategoryController.SubcategoryDelete );

    app.post(`${baseUrl}/admin/catagories/upload-image`, fileUpload.categoryupload.fields([{ name: 'image', maxCount: 1 }]), adminCategoryController.catagoriesuploadimage);
    
}