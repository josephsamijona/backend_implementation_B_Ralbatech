const bannerController = require("../../../controllers/backend/adminBannerController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/admin/banner/list`, auth.isAuthorized, validauth.isAdminAuthorized, bannerController.bannerList);
    app.post(`${baseUrl}/admin/banner/imageupload`, fileUpload.Banner.fields([{ name: 'image', maxCount: 1 }]), bannerController.uploadFiles);
    app.post(`${baseUrl}/admin/banner/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.bannerCreateValidate, bannerController.bannerCreate);
    app.post(`${baseUrl}/admin/banner/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.bannerDetailsValidate, bannerController.bannerDetails);
    app.post(`${baseUrl}/admin/banner/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.bannerUpdateValidate, bannerController.bannerUpdate);
    app.post(`${baseUrl}/admin/banner/delete`, auth.isAuthorized, validauth.isAdminAuthorized, validator.bannerDeleteValidate, bannerController.bannerDelete);
    app.get(`${baseUrl}/admin/banner/store-list`, auth.isAuthorized, validauth.isAdminAuthorized, bannerController.bannerStoreList);
    app.post(`${baseUrl}/admin/banner/department-list`, auth.isAuthorized, validauth.isAdminAuthorized, validator.bannersepartmentValidate, bannerController.bannerDepartmentList);
}