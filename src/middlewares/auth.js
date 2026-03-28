const responseLib = require('../libs/responseLib');
const token = require('../libs/tokenLib');
const check = require('../libs/checkLib');

let isAuthorized = async(req, res, next) => {
    if (!check.isEmpty(req.header('Authorization'))) {
        let auth = req.header('Authorization');
        const actual_token = auth.split(" ")[1];
        token.verifyClaimWithoutSecret(actual_token, (err, decoded) => {
            if (err) {
                let apiResponse = responseLib.generate(1, `Authorization Failed : ${err.message}`, req.headers)
                res.status(401);
                res.send(apiResponse)
            } else {
                req["user"] = decoded.data;
                next()
            }
        });
    } else {
        let apiResponse = responseLib.generate(1, 'Authorization Token Is Missing In Request', req.headers)
        res.status(401);
        res.send(apiResponse)
    }
}

module.exports = {
    isAuthorized: isAuthorized
}