// app.js
'use strict';

const dotenv = require('dotenv');
const envConf = dotenv.config({ debug: process.env.DEBUG });
if (envConf.error && envConf.error.code !== 'ENOENT') {
  throw envConf.error;
}

const express = require('express');
const fs = require('fs');
const path = require('path');

// Middlewares
const { corsMiddleware, validateOriginOrIP } = require('./src/middlewares/cors');
const { authMiddleware } = require('./src/middlewares/hash');
const { responseEncrypt } = require('./src/middlewares/responseEncrypt');

// Config & DB
const connection = require('./www/rest/db');
const appConfig = require('./config/appConfig');

const app = express();

// =============== View Engine ===============
app.set('views', 'views');
app.set('view engine', 'ejs');

// =============== Core Middlewares ===============
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// =============== CORS (env driven) ===============
app.use(corsMiddleware);
app.options('*', corsMiddleware);

// =============== Validate Origin / IP ===============
app.use(validateOriginOrIP);

// =============== Public Route (no auth) ===============
const hashRoutePath = path.join(__dirname, 'src', 'routes', 'hashRoute.js');
if (fs.existsSync(hashRoutePath)) {
  const hashRoute = require(hashRoutePath);
  if (typeof hashRoute.setRouter === 'function') {
    hashRoute.setRouter(app);
  }
}

// =============== Auth Middleware (all below needs auth) ===============
app.use(authMiddleware);

// =============== Encrypt Responses for API routes ===============
app.use(responseEncrypt);

// =============== Bootstrap Other Routes ===============
const routeDirs = [
    path.join(__dirname, 'src', 'routes'),
    path.join(__dirname, 'src', 'routes', 'frontend'),
    path.join(__dirname, 'src', 'routes', 'backend', 'admin'),
    path.join(__dirname, 'src', 'routes', 'backend', 'vendor')
  ];
  
  routeDirs.forEach(routePath => {
    fs.readdirSync(routePath).forEach(file => {
      if (file.endsWith('.js') && file !== 'hashRoute.js') {
        const route = require(path.join(routePath, file));
        if (typeof route.setRouter === 'function') {
          route.setRouter(app);
        }
      }
    });
  });
  
// =============== Home Page ===============
app.get('/', (req, res) => {
  res.render('razorpay.ejs');
});

// =============== Start DB & Server ===============
connection.startDb(app);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
// });
