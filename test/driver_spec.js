const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
const path = require('path');
const async = require('async');
const User = core.User;
const Driver = core.Driver;
const configFile = process.env.CONFIGURATION;
const env = process.env.ENVIRONMENT;
let driver = {};
let user = {};

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
        .once('open', () => {
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
    });
  });

  beforeEach(() => {
    driver = new Driver({
      email: 'lvaldovinos@gmail.com',
      name: 'luis',
      city: 'GDL',
      phoneNumber: '3121212121',
      userId: user._id,
      isActive: true,
    });
  });

  it('should get a valid date', (done) => {
    const currentDate = driver.getCurrentDate();
    const parsedDate = new Date(currentDate);
    should(parsedDate).be.an.instanceOf(Date);
    should(parsedDate.toString()).not.eql('Invalid Date');
    return done(null);
  });

  it('Should create a new driver', (done) => {
    driver.create((err, SavedDriver) => {
      if (err) return done(err);
      should(SavedDriver).be.an.Object();
      should(SavedDriver.email).be.exactly('lvaldovinos@gmail.com');
      should(SavedDriver.name).be.exactly('luis');
      should(SavedDriver.city).be.exactly('GDL');
      should(SavedDriver.phoneNumber).be.exactly('3121212121');
      should(SavedDriver.isActive).be.true();
      return true;
    });
    // Remove saved driver
    driver.remove(done);
  });

  it('Should create a car', (done) => {
    async.series([
      (callback) => {
        driver.create(callback);
      },
      (callback) => {
        driver.createCar({
          carName: 'jeep',
          availableSeats: 4,
        }, callback);
      },
      (callback) => {
        const cars = driver.getCars();
        should(cars).be.an.Array();
        should(cars[0].carName).be.exactly('jeep');
        should(cars[0].availableSeats).be.exactly(4);
        callback();
      },
      (callback) => {
        // Remove saved driver
        driver.remove(callback);
      },
    ]);
    return done(null);
  });

  it('Should return an instance of driver by userId', (done) => {
    Driver.getByUserId(user._id, (err, driverModel) => {
      should(driverModel).be.an.Object();
      should(driverModel).be.an.instanceOf(Driver);
      should(driverModel).have.property('userId', user._id).which.is.a.Object();
      should(driverModel).have.property('email', 'lvaldovinos@gmail.com').which.is.a.String();
      should(driverModel).have.property('name', 'luis').which.is.a.String();
      should(driverModel).have.property('city', 'GDL').which.is.a.String();
      should(driverModel).have.property('phoneNumber', '3121212121').which.is.a.String();
      should(driverModel).have.property('cars').with.lengthOf(0);
      should(driverModel).have.property('createdOn', driverModel.createdOn).which.is.a.Object();
      should(driverModel).have.property('isActive', true);
      should(err).not.be.ok();
      return done(null);
    });
  });

  it('Should set inactive user', (done) => {
    driver.inactive(() => {
      should(driver).have.property('isActive', false);
      done(null);
    });
  });

  it('Should return null object when driver was not found', (done) => {
    const MockedUserId = '54a5450c0000000000000000';
    Driver.getByUserId(MockedUserId, (err, driverModel) => {
      should(driverModel).not.be.ok();
      return done(null);
    });
  });

  it('Should return err when invalid userId', (done) => {
    const invalidMockedUserId = '1111111111111';
    Driver.getByUserId(invalidMockedUserId, (err) => {
      should(err).be.ok();
      return done(null);
    });
  });

  after((done) => {
    async.series([
      (callback) => {
        user.remove(callback);
      },
      (callback) => {
        core.disconect(callback);
      },
    ], done);
  });
});
