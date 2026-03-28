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
let fileUpload = {}

fileUpload.upload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'product/pro' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions GLB!");
        }
    }
});

fileUpload.uploadglb = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'product/pro' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /glb/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions GLB!");
        }
    }
});


fileUpload.categoryupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'catagories/uploadimage' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.userfileupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'user_documents/file' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png|pdf|doc|docx !");
        }
    }
});

fileUpload.brandupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'brand/brand' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.tagupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'tag/tag' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.mediaTextContentupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'mediatextcontent/mediatextcontent' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.storeupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'store/store' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /glb|gltf/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        let extension = path.extname(file.originalname).toLowerCase();
        if (mimetype && extname || extension=='.glb') {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions GLB !");
        }
    }
});

fileUpload.logoupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'store/store' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        let extension = path.extname(file.originalname).toLowerCase();
        if (mimetype && extname || extension=='.jpg') {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpg !");
        }
    }
});
fileUpload.jpgstoreupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'store/store' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpg|JPEG/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        let extension = path.extname(file.originalname).toLowerCase();
        if (mimetype && extname || extension=='.jpg') {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpg !");
        }
    }
});

fileUpload.deptupload = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'department/dept' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.vendorDP = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'admin/vendordp' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});


fileUpload.userDP = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'admin/userdp' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.Banner = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            timeLib.getCurrentTimeStamp();
            cb(null, 'admin/banner' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png !");
        }
    }
});

fileUpload.VendorBanner = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            timeLib.getCurrentTimeStamp();
            cb(null, 'vendor/banner' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 10 }, // 5MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        //console.log('file.originalname',file.originalname);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("Error: Allow files only of extensions jpeg|jpg|png|GIF !");
        }
    }
});

fileUpload.roomTexture = multer({

    // CREATE MULTER-S3 FUNCTION FOR STORAGE
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: process.env.S3_BUCKET,
        metadata: function(req, file, cb) {
            //console.log('file',file);
            cb(null, { fieldName: file.fieldname });
        },

        key: function(req, file, cb) {
            //console.log("****" + JSON.stringify(req.user.vendor_id))
            //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
            timeLib.getCurrentTimeStamp();
            cb(null, 'room/texture' + '-' + timeLib.getCurrentTimeStamp() + path.extname(file.originalname)); //set unique file name if you wise using Date.toISOString()

        }
    }),
    // SET DEFAULT FILE SIZE UPLOAD LIMIT
    limits: { fileSize: 1024 * 1024 * 50 } // 50MB
    // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
    // fileFilter: function (req, file, cb) {
    //     const filetypes = /jpeg|jpg|png|gltf|glb/;

    //     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    //     const mimetype = filetypes.test(file.mimetype);
    //     if (mimetype && extname) {
    //         return cb(null, true);
    //     } else {
    //         cb("Error: Allow files only of extensions jpeg|jpg|png !");
    //     }
    // }
});

fileUpload.getPresignedUrl = async() => {
    const myBucket = process.env.S3_BUCKET
    const myKey = 'rooms/back_wall_02.jpg'
    const signedUrlExpireSeconds = 60 * 5

    const url = s3.getSignedUrl('getObject', {
        Bucket: myBucket,
        Key: myKey,
        Expires: signedUrlExpireSeconds
    })

    //console.log(url)
}





module.exports = fileUpload;