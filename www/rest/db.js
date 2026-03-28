//Import the mongoose module
const mongoose = require('mongoose');
const server = require('./server');

const startDb = (app) => {
    //Set up default mongoose connection
    const mongoDB = process.env.DB_URL;
    mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('debug', false);


    //Get the default connection
    const db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on('error', () => {
        console.error.bind(console, 'MongoDB connection error:');
    });
    db.on('connected', () => {
        //console.log(db.readyState);
        //console.log('MongoDB Connected to : ', mongoDB);
        /* Start http Server*/
        server.startServer(app);
    });

}

module.exports = {
    startDb: startDb
}