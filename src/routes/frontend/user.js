const userController = require("../../controllers/frontend/userController");
const appConfig = require("../../../config/appConfig");
const auth = require("../../middlewares/auth");
const validator = require("../../middlewares/frontend/validator");
const validauth = require("../../middlewares/userValidate");
const fileUpload = require("../../middlewares/fileUpload");


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    app.get(`${baseUrl}/health-check`, (req, res) => {
        res.status(200).send('Rest Service is up and Running!!')
    });

    app.post(`${baseUrl}/user/generateOTP`, validator.generateOTPValidate, userController.generateOtp);
    app.post(`${baseUrl}/user/generateOTPPages`, validator.generateOTPValidatePages, userController.generateOtpPages);
    app.post(`${baseUrl}/user/signup`, validator.signupValidate, userController.signup);
    app.post(`${baseUrl}/user/login`, validator.loginValidate, userController.login);
    app.get(`${baseUrl}/user/details`, auth.isAuthorized, validauth.isUserAuthorized, userController.userDeatils);
    app.post(`${baseUrl}/user/update`, auth.isAuthorized, validauth.isUserAuthorized, validator.userUpadteValidate, userController.userUpdate);
    app.post(`${baseUrl}/user/addAddress`, auth.isAuthorized, validauth.isUserAuthorized, validator.uAddressValidate, userController.createUserAddress);
    app.post(`${baseUrl}/user/addressDetails`, auth.isAuthorized, validauth.isUserAuthorized, validator.uAddressDetailsValidate, userController.UserAddressDetails);
    app.get(`${baseUrl}/user/addressList`, auth.isAuthorized, validauth.isUserAuthorized, userController.listUserAddress);
    app.post(`${baseUrl}/user/updateAddress`, auth.isAuthorized, validauth.isUserAuthorized, validator.uUpdateAddressValidate, userController.UpdateUserAddress);
    app.post(`${baseUrl}/user/deleteAddress`, auth.isAuthorized, validauth.isUserAuthorized, validator.uDeleteAddressValidate, userController.deleteUserAddress);
    app.post(`${baseUrl}/user/changePassword`, auth.isAuthorized, validauth.isUserAuthorized, validator.userChangePasswordValidate, userController.UserChangePassword);
    app.post(`${baseUrl}/user/checkSamePassword`, auth.isAuthorized, validauth.isUserAuthorized, validator.checkSamePasswordValidate, userController.checkSamePassword);
    app.post(`${baseUrl}/user/forgotpassword`, validator.userForgotPasswordValidate, userController.userForgotPassword);
    app.post(`${baseUrl}/user/getShippingTax`,auth.isAuthorized, validauth.isUserAuthorized,  validator.usergetShippingTaxValidate, userController.userGetShippingTax);
    app.post(`${baseUrl}/user/orderCreate`, auth.isAuthorized, validauth.isUserAuthorized, validator.userOrderCreateValidate, userController.userOrderCreate);
    app.post(`${baseUrl}/user/orderPayment`, auth.isAuthorized, validauth.isUserAuthorized, validator.userOrderPaymentValidate, userController.userOrderPayment);
    app.get(`${baseUrl}/user/orderList`, auth.isAuthorized, validauth.isUserAuthorized, userController.userOrderList);
    app.post(`${baseUrl}/user/orderDetails`, auth.isAuthorized, validauth.isUserAuthorized, validator.userOrderDetailsValidate, userController.userOrderDetails);
    app.post(`${baseUrl}/user/contact`, validator.contactValidate, userController.contactmail);
    app.post(`${baseUrl}/user/upload`,fileUpload.userfileupload.fields([{ name: 'image', maxCount: 1 }]), userController.uploadFiles);

    app.post(`${baseUrl}/user/sendAffiliateMail`, validator.sendAffiliateValidate, userController.sendAffiliateMail);
    app.post(`${baseUrl}/user/sendAffinityMail`, validator.sendAffinityValidate, userController.sendAffinityMail);
    app.post(`${baseUrl}/user/sendCreateBusinessAccountMail`, validator.sendCreateBusinessAccountValidate, userController.sendCreateBusinessAccountMail);
    app.get(`${baseUrl}/user/couponsList`, auth.isAuthorized, validauth.isUserAuthorized, userController.couponsList);
    app.get(`${baseUrl}/user/coupons/search`, auth.isAuthorized, validauth.isUserAuthorized, userController.couponSearchByName)
    app.post(`${baseUrl}/user/coupons/search-name-code`, auth.isAuthorized, validauth.isUserAuthorized, userController.couponSearchByNameAndCode)
    app.post(`${baseUrl}/user/coupons/checkUsage`, auth.isAuthorized, validauth.isUserAuthorized, userController.checkCouponUsage);
    
    

}