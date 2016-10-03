const core = require('../lib/core');
const path = require('path');
const config = require('my-config');
const async = require('async');
const should = require('should');
const moment = require('moment');
const User = core.User;
const Driver = core.Driver;
const Ride = core.Ride;
const configFile = process.env.CONFIGURATION;
const env = process.env.ENVIRONMENT;
let user = {};
let ride = {};
let driver = {};

describe('lib/ride test suite', () => {
  before((done) => {
    async.waterfall([
      (callback) => {
        // set up env configuration
        config.init({
          path: path.resolve(__dirname, `../${configFile}`),
          env,
        }, callback);
      },
      (configuration, callback) => {
        // connect to mongo
        core
          .connect(configuration.mongo)
          .on('error', callback)
          .once('open', callback);
      },
      (callback) => {
        // create user
        user = new User({
          username: 'lvaldovinos',
          password: '123456',
          device: {
            osVersion: 'iOS 10',
            model: 'iphone 6s',
          },
        });
        user.create((err) => {
          if (err) return callback(err);
          // create driver
          driver = new Driver({
            email: 'anemail@gmail.com',
            name: 'luis',
            city: 'GDL',
            phoneNumber: '3121212121',
            userId: user._id,
          });
          return driver.create(callback);
        });
      },
      (d, c, callback) => {
        // add car to existing driver
        driver
          .createCar({
            carName: 'jeep',
            availableSeats: 3,
          }, callback);
      },
      (d, c, callback) => {
        // add car to existing driver
        driver
          .createCar({
            carName: 'civic',
            availableSeats: 2,
          }, callback);
      },
    ], done);
  });
  beforeEach((done) => {
    // create ride
    ride = new Ride({
      departureLocation: {
        lng: -103.3773148,
        lat: 20.712713,
      },
      destinationLocation: {
        lng: -103.7008315,
        lat: 19.2665356,
      },
      departureDate: moment().format(),
      fare: 100,
      delayTolerance: 15,
      driverId: driver._id,
      carId: driver.getCars()[1]._id,
    });
    ride.create(done);
  });
  it('Should create a new ride', (done) => {
    Ride.getById(ride.id, (err, existingRide) => {
      if (err) return done(err);
      should(existingRide).be.an.Object();
      should(existingRide).not.be.empty();
      should(existingRide).have.properties([
        'departureLocation',
        'destinationLocation',
        'departureDate',
        'fare',
        'delayTolerance',
      ]);
      should(existingRide.departureLocation).be.eql({
        lng: -103.3773148,
        lat: 20.712713,
      });
      should(existingRide.destinationLocation).be.eql({
        lng: -103.7008315,
        lat: 19.2665356,
      });
      should(existingRide.fare).be.exactly(100);
      should(existingRide.delayTolerance).be.exactly(15);
      return done(null);
    });
  });
  it('Should return null if ride id not exists', (done) => {
    Ride.getById(driver._id, (err, existingRide) => {
      if (err) return done(err);
      should(existingRide).be.exactly(null);
      return done(null);
    });
  });
  it('Should assign one driver to a ride', (done) => {
    should(ride.passengers).have.length(0);
    ride
      .assignPassenger(driver, (err) => {
        if (err) return done(err);
        should(ride.passengers).have.length(1);
        return done(null);
      });
  });
  it('Should throw and error when assigning > availableSeats', (done) => {
    let drivers = [
      {
        email: 'email1@gmail.com',
        name: 'user1',
        city: 'City1',
        phoneNumber: '3121212121',
        username: 'user1',
        password: 'password1',
        device: {
          osVersion: 'iOS 10',
          model: 'iphone 6s',
        },
      },
      {
        email: 'email2@gmail.com',
        name: 'user2',
        city: 'City2',
        phoneNumber: '3121212121',
        username: 'user2',
        password: 'password2',
        device: {
          osVersion: 'iOS 10',
          model: 'iphone 6s',
        },
      },
    ];
    async.waterfall([
      (callback) => {
        // iterate through drivers and create
        async.map(drivers, (d, cb) => {
          const newUser = new User({
            username: d.username,
            password: d.password,
            device: d.device,
          });
          user.create((userErr) => {
            if (userErr) return cb(userErr);
            // create driver
            const newDriver = new Driver({
              email: d.email,
              name: d.name,
              city: d.city,
              phoneNumber: d.phoneNumber,
              userId: newUser._id,
            });
            return driver.create((driverErr) => {
              if (driverErr) return cb(driverErr);
              return cb(null, newDriver);
            });
          });
        }, callback);
      },
      // assign new drivers to ride
      (newDrivers, callback) => {
        drivers = newDrivers;
        async.each(newDrivers, ride.assignPassenger.bind(ride), callback);
      },
      // try to assign a third driver
      (callback) => {
        should(ride.passengers).have.length(2);
        ride.assignPassenger(driver, callback);
      },
    ], (err) => {
      should(err).be.ok();
      should(err.code).be.exactly('NOAVAILABLESEATS');
      should(err.message).be.exactly('There are no more available seats in this ride');
      // remove drivers
      async.each(drivers, (d, callback) => d.remove(callback), done);
    });
  });
  afterEach((done) => {
    ride.remove(done);
  });
  after((done) => {
    async.series([
      (callback) => {
        driver.remove(callback);
      },
      (callback) => {
        user.remove(callback);
      },
    ], done);
  });
  after((done) => {
    core.disconect(done);
  });
});
