const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
const path = require('path');
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
      should(users).have.length(1);
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
  afterEach((done) => {
    user.remove(done);
  });
  after((done) => {    
    core.disconect(done);
  });
});
