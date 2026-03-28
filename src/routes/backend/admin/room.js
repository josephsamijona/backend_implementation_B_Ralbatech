const roomController = require("../../../controllers/backend/adminRoomController")
const appConfig = require("../../../../config/appConfig");
const auth = require("../../../middlewares/auth");
const validator = require("../../../middlewares/backend/adminValidator");
const fileUpload = require("../../../middlewares/fileUpload");
const validauth = require("../../../middlewares/userValidate");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;


    app.get(`${baseUrl}/admin/roomsize/list`, auth.isAuthorized, validauth.isAdminAuthorized, roomController.roomSizeList);
    app.get(`${baseUrl}/admin/roomelement/list`, auth.isAuthorized, validauth.isAdminAuthorized, roomController.roomElementList);
    app.get(`${baseUrl}/admin/roomtexture/list`, auth.isAuthorized, validauth.isAdminAuthorized, roomController.roomTextureList);
    app.post(`${baseUrl}/admin/roomtexture/imageUpload`,  fileUpload.roomTexture.fields([{ name: 'image', maxCount: 1 }]), roomController.uploadRoomTextureFiles);
    app.post(`${baseUrl}/admin/roomtexture/create`, auth.isAuthorized, validauth.isAdminAuthorized, validator.createRoomtextureValidate, roomController.createRoomtexture);
    app.post(`${baseUrl}/admin/roomtexture/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.detailsRoomtextureValidate, roomController.detailsRoomtexture);
    app.post(`${baseUrl}/admin/roomtexture/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.updateRoomtextureValidate, roomController.updateRoomtexture);
    app.post(`${baseUrl}/admin/roomtexture/delete`, auth.isAuthorized, validauth.isAdminAuthorized, validator.deleteRoomtextureValidate, roomController.deleteRoomtexture);
    app.get(`${baseUrl}/admin/department/list`, auth.isAuthorized, validauth.isAdminAuthorized, roomController.departmentList);
    app.post(`${baseUrl}/admin/department/imageUpload`,  fileUpload.deptupload.fields([{ name: 'image', maxCount: 1 }]), roomController.uploadDepartmentFiles);
    app.post(`${baseUrl}/admin/department/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.departmentDetailsValidate, roomController.departmentDetails);
    app.post(`${baseUrl}/admin/department/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.departmentUpdateValidate, roomController.departmentUpdate);
    app.post(`${baseUrl}/admin/department/statuschange`, auth.isAuthorized, validauth.isAdminAuthorized, validator.departmentUpdateValidate, roomController.departmentUpdate);
    app.post(`${baseUrl}/admin/department/delete`, auth.isAuthorized, validauth.isAdminAuthorized, validator.departmentDeleteValidate, roomController.departmentDelete);
    app.get(`${baseUrl}/admin/room/list`, auth.isAuthorized, validauth.isAdminAuthorized, roomController.roomList);
    app.post(`${baseUrl}/admin/room/delete`, auth.isAuthorized, validauth.isAdminAuthorized, validator.roomDeleteValidate, roomController.roomDelete);
    app.post(`${baseUrl}/admin/room/update`, auth.isAuthorized, validauth.isAdminAuthorized, validator.roomUpdateValidate, roomController.updateRoom);
    app.post(`${baseUrl}/admin/room/details`, auth.isAuthorized, validauth.isAdminAuthorized, validator.roomDetailsValidate, roomController.roomDetails);
    app.post(`${baseUrl}/admin/room/statuschange`, auth.isAuthorized, validauth.isAdminAuthorized, validator.roomUpdateValidate, roomController.updateRoom);

}