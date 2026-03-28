const responseLib = require('../libs/responseLib');
const token = require('../libs/tokenLib');
const check = require('../libs/checkLib');

let isAdminAuthorized = async(req, res, next) => {

    let bodydata = req.user

    if (bodydata.hasOwnProperty('admin_id')) {
        next();

    } else {
        let apiResponse = responseLib.generate(1, `Authorization Failed : Wrong token, this is not belongs to admin token`, req.headers)
        res.send(apiResponse)
    }
}

let isVendorAuthorized = async(req, res, next) => {

    let bodydata = req.user

    if (bodydata.hasOwnProperty('vendor_id')) {
        next();

    } else {
        let apiResponse = responseLib.generate(1, `Authorization Failed : Wrong token, this is not belongs to vendor token`, req.headers)
        res.send(apiResponse)
    }
}


let isUserAuthorized = async(req, res, next) => {

    let bodydata = req.user

    if (bodydata.hasOwnProperty('user_id')) {
        next();

    } else {
        let apiResponse = responseLib.generate(1, `Authorization Failed : Wrong token, this is not belongs to user token`, req.headers)
        res.send(apiResponse)
    }
}



module.exports = {
    isAdminAuthorized: isAdminAuthorized,
    isVendorAuthorized: isVendorAuthorized,
    isUserAuthorized: isUserAuthorized

}