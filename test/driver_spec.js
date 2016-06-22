const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
const path = require('path');
const Driver = core.Driver;
const configFile = process.env.CONFIGURATION;
const env = process.env.ENVIRONMENT;
let driver = {};

describe('lib/driver test suite', () => {
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
    driver = new Driver({
      email: 'lvaldovinos@gmail.com',
      name: 'luis',
      city: 'GDL',
      phoneNumber: '3121212121',
    });
    driver.create(done);
  });
  it('Should create a new driver', (done) => {
    Driver.getAll((err, drivers) => {
      if (err) return done(err);
      should(drivers).be.an.Array();
      should(drivers).have.length(1);
      should(drivers[0].email).be.exactly('lvaldovinos@gmail.com');
      should(drivers[0].name).be.exactly('luis');
      should(drivers[0].city).be.exactly('GDL');
      should(drivers[0].phoneNumber).be.exactly('3121212121');
      return done(null);
    });
  });
  afterEach((done) => {
    driver.remove(done);
  });
});