const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
const moment = require('moment');
const path = require('path');
const async = require('async');
const User = core.User;
const Driver = core.Driver;
const WaitingList = core.WaitingList;
const configFile = process.env.CONFIGURATION;
const env = process.env.ENVIRONMENT;
let driver = {};
let user = {};
let waitingList = {};

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

  beforeEach((done) => {
    async.series([
      (callback) => {
        driver = new Driver({
          email: 'lvaldovinos@gmail.com',
          name: 'luis',
          city: 'GDL',
          phoneNumber: '3121212121',
          userId: user._id,
          isActive: true,
        });
        driver.create(callback);
      },
      (callback) => {
        // create the instance of the waiting list
        waitingList = new WaitingList({
          pickupLocation: { lng: -103.3773148, lat: 20.712713 },
          dropOffLocation: { lng: -103.7008315, lat: 19.2665356 },
          departureDate: moment().format(),
          driverId: driver._id,
          isActive: true,
        });
        callback();
      },
    ], done);
  });

  it('should get a valid date', (done) => {
    const currentDate = driver.getCurrentDate();
    const parsedDate = new Date(currentDate);
    should(parsedDate).be.an.instanceOf(Date);
    should(parsedDate.toString()).not.eql('Invalid Date');
    return done(null);
  });

  it('Should create a new WaitingList', (done) => {
    async.series([
      (callback) => {
        waitingList.create((err, savedWatingList, saved) => {
          const parsedDepartureDate = new Date(savedWatingList.departureDate);
          const parsedCreatedOn = new Date(savedWatingList.createdOn);

          should(err).be.exactly(null);
          should(saved).be.exactly(1); // this will tell us if the data were saved
          should(savedWatingList).be.an.Object();
          should(savedWatingList).not.be.empty();
          should(savedWatingList).have.properties([
            'departureDate',
            'pickupLoc',
            'dropOffLoc',
            'driverId',
            'createdOn',
            'isActive',
          ]);
          should(parsedDepartureDate).be.an.instanceOf(Date);
          should(parsedDepartureDate.toString()).not.eql('Invalid Date');
          should(savedWatingList.pickupLocation).be.eql({ lng: -103.3773148, lat: 20.712713 });
          should(savedWatingList.dropOffLocation).be.eql({ lng: -103.7008315, lat: 19.2665356 });
          should(savedWatingList.driverId).be.exactly(driver._id);
          should(parsedCreatedOn).be.an.instanceOf(Date);
          should(parsedCreatedOn.toString()).not.eql('Invalid Date');
          should(savedWatingList.isActive).be.true();

          callback();
        });
      },
      (callback) => {
        waitingList.remove(callback);
      },
    ], done);
  });

  it('Should delete waitingList', (done) => {
    async.series([
      (callback) => {
        waitingList.create(callback);
      },
      (callback) => {
        // remove waitingList after waitingList is created
        waitingList.remove((err, waitingListResult) => {
          WaitingList.findById(waitingListResult._id, (findErr, product) => {
            should(findErr).be.exactly(null);
            should(product).be.exactly(null);
            callback();
          });
        });
      },
    ], done);
  });

  it('Should inactive waitingList', (done) => {
    async.series([
      (callback) => {
        // save new waitingList
        waitingList.create((err, waitingListResult) => {
          waitingList = waitingListResult;
          callback();
        });
      },
      (callback) => {
        // remove waitingList after waitingList is created
        waitingList.inactive((err, waitingListResult, saved) => {
          const parsedDepartureDate = new Date(waitingListResult.departureDate);
          const parsedCreatedOn = new Date(waitingListResult.createdOn);

          should(err).be.exactly(null);
          should(saved).be.exactly(1); // this will tell us if the data were saved
          should(waitingListResult).be.an.Object();
          should(waitingListResult).not.be.empty();
          should(waitingListResult).have.properties([
            'departureDate',
            'pickupLoc',
            'dropOffLoc',
            'driverId',
            'createdOn',
            'isActive',
          ]);
          should(parsedDepartureDate).be.an.instanceOf(Date);
          should(parsedDepartureDate.toString()).not.eql('Invalid Date');
          should(waitingListResult.pickupLocation).be.eql({ lng: -103.3773148, lat: 20.712713 });
          should(waitingListResult.dropOffLocation).be.eql({ lng: -103.7008315, lat: 19.2665356 });
          should(waitingListResult.driverId).be.exactly(driver._id);
          should(parsedCreatedOn).be.an.instanceOf(Date);
          should(parsedCreatedOn.toString()).not.eql('Invalid Date');
          should(waitingListResult.isActive).be.not.true();

          callback();
        });
      },
      (callback) => {
        waitingList.remove(callback);
      },
    ], done);
  });

  afterEach((done) => {
    driver.remove(done);
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
