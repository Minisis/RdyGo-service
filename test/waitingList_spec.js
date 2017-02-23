const core = require('../lib/core');
const config = require('my-config');
const should = require('should');
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

describe.skip('lib/waitingList test suite', () => {
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
          origin: 'Colima, Colima, Mexico',
          destination: 'Guadalajara, Jalisco, México',
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

  it('Should create a new waitingList', (done) => {
    async.series([
      (callback) => {
        waitingList.create((err, savedWatingList, saved) => {
          const parsedCreatedOn = new Date(savedWatingList.createdOn);

          should(err).be.exactly(null);
          should(saved).be.exactly(1); // this will tell us if the data were saved
          should(savedWatingList).be.an.Object();
          should(savedWatingList).not.be.empty();
          should(savedWatingList).have.properties([
            'origin',
            'destination',
            'driverId',
            'members',
            'createdOn',
            'isActive',
          ]);
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
          WaitingList.findById(waitingListResult._id, (findErr, result) => {
            should(findErr).be.exactly(null);
            should(result).be.exactly(null);
            callback();
          });
        });
      },
    ], done);
  });

  it(('should add a member to waitingList'), (done) => {
    let driver2 = {};
    async.series([
      (callback) => {
        // save new waitingList
        waitingList.create((err, waitingListResult) => {
          waitingList = waitingListResult;
          callback();
        });
      },
      (callback) => {
        driver2 = new Driver({
          email: 'audel91@gmail.com',
          name: 'Audel',
          city: 'GDL',
          phoneNumber: '3121212121',
          userId: user._id,
          isActive: true,
        });
        driver2.create(callback);
      },
      (callback) => {
        // add new member
        waitingList.addMember({
          driverId: driver2.id,
          departureTime: '04/07/2013',
        }, (cb) => {
          should(waitingList.members).be.an.Array();
          should(waitingList.members).have.length(1);
          should(waitingList.members[0]).have.properties([
            'driverId',
            'departureTime',
            'createdOn',
          ]);
          callback(cb);
        });
      },
      (callback) => {
        waitingList.remove(callback);
      },
      (callback) => {
        driver2.remove(callback);
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
          const parsedCreatedOn = new Date(waitingListResult.createdOn);

          should(err).be.exactly(null);
          should(saved).be.exactly(1); // this will tell us if the data were saved
          should(waitingListResult).be.an.Object();
          should(waitingListResult).not.be.empty();
          should(waitingListResult).have.properties([
            'origin',
            'destination',
            'driverId',
            'members',
            'createdOn',
            'isActive',
          ]);
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
