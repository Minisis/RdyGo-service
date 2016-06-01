'use strict';

var request = require('supertest'),
  should = require('should'),
  createWorker = require('../server/worker'),
  myConfig = require('my-config'),
  path = require('path'),
  app = {};

describe('Dummy test', function() {
  before('Configure http server', function(done) {
    myConfig.init({
      path: path.resolve(process.env.CONFIGURATION),
      env: process.env.ENVIRONMENT
    }, function(errConf, configuration) {
      if (errConf) return done(errConf);
      // create http server
      return createWorker(configuration, function(err, server) {
        if (err) return done(err);
        app = server;
        return done(null);
      });
    });
  });
  it('hello dude nice hot deploy!!', function(done) {
    request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        should(res.body.data.message).be.exactly('hello dude nice hot deploy!!');
        return done(null);
      });
  });
});
