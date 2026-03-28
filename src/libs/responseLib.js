/* response generation library for api */
const encLib = require('./encLib')
const isDev = process.env.NODE_ENV === 'development'

let generateEnc = (err, message, data) => {
    // Normalize message text by trimming leading/trailing whitespace
    if (typeof message === 'string') {
      message = message.trimStart();
    }
    // In development, do not encrypt response data
    if (isDev) {
      let response = {
        error: err,
        message: message,
        data: data
      }
      return response
    }
    let response = {
      error: err,
      message: message,
      data: data?encLib.encrypt(data).toString('base64'):data
    }
    return response
  }
  
  // Plain (non-encrypted) response generator
  let generate = (err, message, data) => {
    // Normalize message text by trimming leading/trailing whitespace
    if (typeof message === 'string') {
      message = message.trimStart();
    }
    let response = {
      error: err,
      message: message,
      data: data
    }
    return response
  }

  module.exports = {
    generate: generate,
    generateEnc: generateEnc
  }