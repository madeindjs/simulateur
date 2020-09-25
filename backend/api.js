const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
require('./config/worker');

process.on('unhandledRejection', (reason, _promise) => {
  const message = reason && reason.message;
  if (message) {
    console.error(`Unhandled Rejection with '${message}'`);
  } else {
    console.error(`Unhandled Rejection at: `);
  }
});

// Setup mongoose
require('./config/mongoose')(mongoose, config);

// Setup Express
const app = express();

app.use(require('./config/api'));

app.use((err, req, res, _next) => {
    res.status(500).send('Something broke!');
});

module.exports = app;
