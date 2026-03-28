//const dbConfig = require('./dbConfig.json')[process.env.NODE_ENV]
const events = require('events');
const eventEmitter = new events.EventEmitter();
const rngClass = require('../src/algo/rng');
const pRNG = new rngClass();
const rzp = require('razorpay');
let razp = null;
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
    razp = new rzp({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET
    });
}
let appConfig = {};

appConfig.eventEmitter = eventEmitter;
appConfig.allowedCorsOrigin = "*";

appConfig.apiVersion = '/api/v1';
appConfig.socketNameSpace = 'wsio';
appConfig.sessionExpTime = 4 * 60 * 60; // 4 hr in seconds
appConfig.otpLinkExpTime = (150);
appConfig.pRNG = pRNG;
appConfig.razp = razp;
appConfig.redis_url = process.env.REDIS_URL;


appConfig.baseUrl = 'http://localhost:5000/api/v1/';


module.exports = appConfig;