require('dotenv').config();
let nodemailer = require("nodemailer");
let AWS = require("aws-sdk");



let AWSConf ={
    apiVersion: "2010-12-01",
    region: process.env.S3_REGION_EMAIL_CONFIG,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  }

  AWS.config.update(AWSConf);

let sendMailFunc = async (params) => {
    try{

      let email_temp = {
        Destination: {
          /* required */
          ToAddresses: params.receiver_mail
        },
        Message: {
          /* required */
          Body: {
            /* required */
            Html: {
              Charset: "UTF-8",
              Data: `${params.template}`
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `${params.subject}`
          }
        },
        Source: process.env.APP_EMAIL,
        /* required */
        ReplyToAddresses: [`${process.env.APP_EMAIL}`],
      };

        //console.log('AWSConf',AWSConf)
        let ses = new AWS.SES(AWSConf);
        let del_status = await ses.sendEmail(email_temp).promise();
        //console.log('del_status',del_status);
    }catch(err){
        //console.log(err)
    }finally{
        //console.log('function successfully executed!')
    }
}


let sendEmail = async (tomail, params) => {
  try {
    // Create the Nodemailer transporter to generate raw email content
    const transporter = nodemailer.createTransport({
      streamTransport: true, // Use stream transport to get raw message
      buffer: true,
    });

    // Check if params.cc is an array, and join it into a comma-separated string if true
    const ccEmails = Array.isArray(params.cc) ? params.cc.join(',') : params.cc;
    // Email options with attachment
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: tomail,
      cc: ccEmails, // Use the formatted cc emails
      subject: params.subject,
      html: `${params.body}`, // Email body content
      attachments: params.attachments // Attachments if any
    };

    // Generate the raw email as a Buffer
    const rawMessage = await transporter.sendMail(mailOptions);

    // Prepare the SES command with raw email directly
    const sesParams = {
      RawMessage: {
        Data: rawMessage.message, // Directly pass the raw message Buffer
      },
    };

    // Initialize AWS SES
    let ses = new AWS.SES(AWSConf);

    // Send the email using SES
    let del_status = await ses.sendRawEmail(sesParams).promise();
    //console.log('del_status', del_status);
  } catch (err) {
    //console.log(err);
  } finally {
    //console.log('function successfully executed!');
  }
};



module.exports = {
  sendMailFunc: sendMailFunc,
  sendEmail: sendEmail
}