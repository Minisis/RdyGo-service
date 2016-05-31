'use strict';

var express = require('express'),
  http = require('http'),
  bodyParser = require('body-parser'),
  router = require('./router'),
  app = express();


// parse Content-Type application/json
app.use(bodyParser.json({
  limit: '10mb'
}));

// parse Content-Type x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  limit: '10kb',
  extended: false
}));

// enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Content-Type, Accept');
  next();
});

// start server
module.exports = function(configuration, cb) {
  // api router
  app.use('/', router(configuration));
  return process.nextTick(function() {
    return cb(null, http.createServer(app));
  });
};
