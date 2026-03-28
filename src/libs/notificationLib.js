const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const response = require('./responseLib');
const appConfig = require('../../config/appConfig');
let AWS = require('aws-sdk');
let aws = require("@aws-sdk/client-ses");
let { defaultProvider } = require("@aws-sdk/credential-provider-node");

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
  defaultProvider,
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});
// const transporter = nodemailer.createTransport(smtpTransport({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   auth: {
//     user: process.env.APP_EMAIL,
//     pass: process.env.APP_EMAILPASS
//   }
// }));

// const admin = require('firebase-admin');
// const serviceAccount = require("../../config/hearts-queen-firebase-adminsdk-31fan-2716227964.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

AWS.config.update({region: process.env.AWS_REGION});

let sendSMS = (options) => {
    return new Promise((resolve,reject) => {
        var params = {
            Message: `OTP : ${options.otp}`,
            PhoneNumber: '+91' + options.mobile
        };
    
        var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    
        publishTextPromise.then(
             (data) => {
                //console.log(JSON.stringify({ MessageID: data}));
                resolve(data)
            }).catch(
                 (err) => {
                    //console.log(JSON.stringify({ Error: err }));
                    reject(err)
                });
    
    })

}

let sendAPKLink = (options) => {
  return new Promise((resolve,reject) => {
      var params = {
          Message: `${options.uri}`,
          PhoneNumber: '+91' + options.mobile
      };
  
      var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
  
      publishTextPromise.then(
           (data) => {
              //console.log(JSON.stringify({ MessageID: data}));
              resolve(data)
          }).catch(
               (err) => {
                  //console.log(JSON.stringify({ Error: err }));
                  reject(err)
              });
  
  })

}

let sendEmailOtp = (options)=>{
         return new Promise((resolve,reject)=>{
              
              let mailOptions = {
                  from: process.env.APP_EMAIL,
                  to: options.communication_details,
                  subject: 'OTP Validation Mail From Game Engine',
                  text: `OTP : ${options.otp}`
                };
              
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    //console.log(error);
                    let apiResponse = response.generate(true, error.message, 0, null)
                    reject(apiResponse)
                  } else {
                    //console.log('Email sent: ' + info.response);
                    let apiResponse = response.generate(false, 'Otp sent successfully', 1, JSON.stringify({user_id:options.user_id}))
                    resolve(apiResponse)
                  }
                }); 
         })
}
let sendEmailResetPasswordLink = (options)=>{
  return new Promise((resolve,reject)=>{
       
       let mailOptions = {
           from: process.env.APP_EMAIL,
           to: options.communication_details,
           subject: 'Password Reset Link from Poker Engine',
           text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
           'http://' + options.uri + appConfig.apiVersion +'/reset/' + options.token + '\n\n' +  
           'If you did not request this, please ignore this email and your password will remain unchanged.\n'  
         };
       
         transporter.sendMail(mailOptions, function(error, info){
           if (error) {
             //console.log(error);
             let apiResponse = response.generate(true, error.message, 0, null)
             reject(apiResponse)
           } else {
             //console.log('Email sent: ' + info.response);
             let apiResponse = response.generate(false, 'Link sent to Registered Mail successfully', 1, null)
             resolve(apiResponse)
           }
         }); 
  })
}

let sendEmailResetPasswordConfirmation = (options)=>{
  return new Promise((resolve,reject)=>{
       
       let mailOptions = {
           from: process.env.APP_EMAIL,
           to: options.communication_details,
           subject: 'ATTENTION : HeartsFantasy password has been changed',
           text: 'Hello,\n\n' +  
           'This is a confirmation that the password for your account : ' + options.communication_details + ' has just been changed.\n'   
         };
       
         transporter.sendMail(mailOptions, function(error, info){
           if (error) {
             //console.log(error);
             let apiResponse = response.generate(true, error.message, 0, null)
             reject(apiResponse)
           } else {
             //console.log('Email sent: ' + info.response);
             let apiResponse = response.generate(false, 'Password reset successfully and a confirmation mail sent to registered mail', 1, null)
             resolve(apiResponse)
           }
         }); 
  })
}

let sendPushNotification = (message) => {
  admin.messaging().send(message).then((response)=>{
    //console.log("successfully sent push message",response);
  }).catch((err)=>{
    //console.log("error sending push",err);
  })
}


module.exports = {
    sendEmailOtp :sendEmailOtp,
    sendEmailResetPasswordLink :sendEmailResetPasswordLink,
    sendEmailResetPasswordConfirmation :sendEmailResetPasswordConfirmation,
    sendSMS:sendSMS,
    sendPushNotification:sendPushNotification,
    sendAPKLink:sendAPKLink
}