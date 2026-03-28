const roomController = require("../../../controllers/backend/roomController");
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/validator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");



module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.post(`${baseUrl}/vender/roomsize/create`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.createRoomSize);
    app.get(`${baseUrl}/vender/roomsize/list`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.roomSizeList);
    app.get(`${baseUrl}/vender/department/list`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.departmentList);
    app.post(`${baseUrl}/vender/roomelement/create`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.createRoomElement);
    app.get(`${baseUrl}/vender/roomelement/list`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.roomElementList);
    app.post(`${baseUrl}/vender/roomtexture/create`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.createRoomtexture);
    app.get(`${baseUrl}/vender/roomtexture/list`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.roomTextureList);
    app.post(`${baseUrl}/vender/room/add`, auth.isAuthorized, validauth.isVendorAuthorized, validator.roomValidate, roomController.createRoom);
    app.get(`${baseUrl}/vender/room/list`, auth.isAuthorized, validauth.isVendorAuthorized, roomController.roomList);
    app.get(`${baseUrl}/vender/room/roomurl`, fileUpload.getPresignedUrl);
    app.post(`${baseUrl}/vender/room/details`, auth.isAuthorized, validauth.isVendorAuthorized, validator.roomDetailsValidate, roomController.roomDetails);
    app.post(`${baseUrl}/vender/room/availlablity`, auth.isAuthorized, validauth.isVendorAuthorized, validator.roomAvailableValidate, roomController.roomAvailablity);
    app.post(`${baseUrl}/vender/room/update`, auth.isAuthorized, validauth.isVendorAuthorized, validator.roomUpdateValidate, roomController.updateRoom);
    app.post(`${baseUrl}/vender/room/delete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.roomDeleteValidate, roomController.deleteRoom);
    app.post(`${baseUrl}/vender/texture`, roomController.textureDetails);
    app.post(`${baseUrl}/vender/department/imageUpload`, fileUpload.deptupload.fields([{ name: 'image', maxCount: 1 }]), roomController.uploadDepartmentFiles);
    app.post(`${baseUrl}/vender/department/create`, auth.isAuthorized, validauth.isVendorAuthorized, validator.departmentValidate, roomController.departmentCreate);
    app.post(`${baseUrl}/vender/department/details`, auth.isAuthorized, validauth.isVendorAuthorized, validator.departmentDetailsValidate, roomController.departmentDetails);
    app.post(`${baseUrl}/vender/department/update`, auth.isAuthorized, validauth.isVendorAuthorized, validator.departmentUpdateValidate, roomController.departmentUpdate);
    app.post(`${baseUrl}/vender/department/delete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.departmentDeleteValidate, roomController.departmentDelete);
    app.post(`${baseUrl}/vender/department/imagedelete`, auth.isAuthorized, validauth.isVendorAuthorized, validator.departmentImageDeleteValidate, roomController.departmentImageDelete);
}