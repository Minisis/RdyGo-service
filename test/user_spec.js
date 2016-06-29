const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
const path = require('path');
const async = require('async');
const User = core.User;
const configFile = process.env.CONFIGURATION;
const env = process.env.ENVIRONMENT;
let user = {};

describe('lib/user test suite', () => {
  before((done) => {
    // read config file
    config.init({
      path: path.resolve(__dirname, `../${configFile}`),
      env,
    }, (err, configuration) => {
      if (err) return done(err);
      // connect to mongo
      return core
        .connect(configuration.mongo)
        .on('error', done)
        .once('open', done);
    });
  });
  beforeEach((done) => {
    user = new User({
      username: 'lvaldovinos',
      password: '123456',
      device: {
        osVersion: 'iOS 10',
        model: 'iphone 6s',
      },
    });
    user.create(done);
  });
  it('Should create a new user', (done) => {
    User.getAll((err, users) => {
      if (err) return done(err);
      should(users).be.an.Array();
      should(users.filter((u) => u.username === user.username)).have.length(1);
      should(users[0].username).be.exactly('lvaldovinos');
      return done(null);
    });
  });
  it('Should create a token, when creating a user', (done) => {
    user.getTokens((err, tokens) => {
      if (err) return done(err);
      should(tokens).be.an.Array();
      should(tokens[0]).have.properties([
        'tkn',
        'device',
        'createdBy',
      ]);
      should(tokens[0].createdBy.username).be.exactly('lvaldovinos');
      should(tokens[0].device).be.an.Object();
      should(tokens[0].device.osVersion).be.exactly('iOS 10');
      should(tokens[0].device.model).be.exactly('iphone 6s');
      return done(null);
    });
  });
  it('Should get a user by credentials', (done) => {
    User.getByCredentials({
      username: 'lvaldovinos',
      password: '123456',
    }, (err, existingUser) => {
      if (err) return done(err);
      should(existingUser.username).be.exactly('lvaldovinos');
      should(existingUser.createToken).be.a.Function();
      return done(null);
    });
  });
  it('Should get null if credentials not exist', (done) => {
    User.getByCredentials({
      username: 'asdfasdf',
      password: 'asfd',
    }, (err, existingUser) => {
      if (err) return done(err);
      should(existingUser).be.exactly(null);
      return done(null);
    });
  });
  it('Should create a token once user is found by credentials', (done) => {
    async.waterfall([
      (callback) => {
        User.getByCredentials({
          username: 'lvaldovinos',
          password: '123456',
        }, callback);
      },
      (existingUser, callback) => {
        should(existingUser.username).be.exactly(user.username);
        existingUser.createToken({
          osVersion: 'iOS 9',
          model: 'iphone 6',
        }, (err) => callback(err, existingUser));
      },
      (existingUser, callback) => {
        existingUser.getTokens((err, tokens) => {
          if (err) return callback(err);
          should(tokens).have.length(2);
          const deviceModels = tokens.reduce((prev, curr) => {
            prev.push(curr.device.model);
            return prev;
          }, []);
          should(deviceModels).containDeep(['iphone 6', 'iphone 6s']);
          return callback(null);
        });
      },
    ], done);
  });
  it('Should successfully compare an existing token', (done) => {
    async.waterfall([
      (callback) => {
        user.getTokens(callback);
      },
      (tokens, callback) => {
        User.getByToken(tokens[0].tkn, callback);
      },
    ], (err, existingUser) => {
      if (err) return done(err);
      should(existingUser).containEql({
        username: 'lvaldovinos',
      });
      should(existingUser).containEql({
        _id: user._id,
      });
      return done(null);
    });
  });
  it('Should return null when no user is found by token', (done) => {
    User.getByToken('13241234lkajdhsfglakdhfg', (err, existingUser) => {
      if (err) return done(err);
      should(existingUser).be.exactly(null);
      return done(null);
    });
  });
  afterEach((done) => {
    user.remove(done);
  });
});
