const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const secretKey = process.env.ENC_KEY;
const time = require('./timeLib');
const config = require('../../config/appConfig');


// let generateToken = (data, cb) => {

//   try {
//     let claims = {
//       jwtid: shortid.generate(),
//       iat: time.getCurrentTimeStamp(),
//       exp: time.getCurrentTimeStamp() + data.exptime,
//       sub: 'token',
//       iss: 'platform',
//       data: data
//     }
//     let tokenDetails = {
//       token: jwt.sign(claims, secretKey),
//       secret : secretKey
//     }
//     cb(null, tokenDetails)
//   } catch (err) {
//     //console.log(err)
//     cb(err, null)
//   }
// }// end generate token 

let generateToken = (data) => {
  return new Promise((resolve, reject)=>{
    try{
      let claims = {
        jwtid: shortid.generate(),
        iat: time.getCurrentTimeStamp(),
        exp: time.getCurrentTimeStamp() + config.sessionExpTime,
        sub: 'token',
        iss: 'platform',
        data: data
      }
      let tokenDetails = {
        token: jwt.sign(claims, secretKey),
        secret : secretKey
      }
      //resolve(tokenDetails);
      resolve(jwt.sign(claims, secretKey));
    }catch(err){
      reject(err);
    }
  })
}// end generate token 

let verifyClaim = (token,secret,cb) => {
  // verify a token symmetric
  jwt.verify(token, secret, function (err, decoded) {
    if(err){
      cb(err,null)
    }
    else{
      cb(null,decoded);
    }  
 
 
  });


}// end verify claim 

let verifyClaimWithoutSecret = (token,cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      cb(err,null)
    }
    else{
      cb(null,decoded);
    }  
 
 
  });


}// end verify claim 




module.exports = {
  generateToken: generateToken,
  verifyToken :verifyClaim,
  verifyClaimWithoutSecret :verifyClaimWithoutSecret
}
