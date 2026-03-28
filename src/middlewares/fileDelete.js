const timeLib = require("../../src/libs/timeLib");

let multer = require('multer');
let path = require('path');

const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

AWS.config.update({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    },
    region: process.env.S3_REGION
});

var s3 = new AWS.S3();

//console.log("appRoot" + appRoot)
/** IMAGE FILE UPLOADING**/
let fileDelete = {}

fileDelete.productDelete = async(filename) => {
    try {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET + '/product', Key: filename }).promise();
        return { success: true, data: "File deleted Successfully" }
    } catch (error) {
        return { success: false, data: null }
    }
}

fileDelete.storeDelete = async(filename) => {
    try {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET + '/store', Key: filename }).promise();
        return { success: true, data: "File deleted Successfully" }
    } catch (error) {
        return { success: false, data: null }
    }
}

fileDelete.departmentDelete = async(filename) => {
    try {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET + '/department', Key: filename }).promise();
        return { success: true, data: "File deleted Successfully" }
    } catch (error) {
        return { success: false, data: null }
    }
}


// fileDelete.prescriptionDelete = async(filename) => {
//     try {
//         await s3.deleteObject({ Bucket: process.env.S3_BUCKET + '/user_documents', Key: filename }).promise();
//         return { success: true, data: "File deleted Successfully" }
//     } catch (error) {
//         return { success: false, data: null }
//     }
// }


module.exports = fileDelete;