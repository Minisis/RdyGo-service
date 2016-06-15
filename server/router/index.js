'use strict';

var express = require('express'),
  wr = require('express-wr'),
  router = express.Router(),
  Users = require('../../user/user.js');

module.exports = function() {
  // add wr to express
  wr(express);
  // hello world
  router.get('/hello', function(req, res) {
    express.wr(res, {
      message: 'hello dude nice hot deploy!!'
    });
  });
  // 404 hanlder
  router.use(function(req, res) {
    express.wr(res, {
      code: 404,
      data: {},
      message: 'Resource not found'
    }, {
      error: 'Resource not found'
    });
  });
  // error handler
  router.use(function(err, req, res, next) {
    var code = 500;
    if (err.hasOwnProperty('code')) {
      if (err.code >= 400 && err.code <= 500) {
        code = err.code;
      }
    }
    // send error to user
    express.wr(res, {
      code: code,
      data: {},
      message: err.message
    }, {
      error: err.message
    });
    // log error if 500
    if (code >= 500) {
      req
        .logger
        .fatal('Unexpected error:', err);
    }
  });

  return router;
};
