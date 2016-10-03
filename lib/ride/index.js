const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const Driver = require('../driver');
const Schema = mongoose.Schema;
const rideSchema = new Schema({
  departureLoc: {
    required: true,
    type: [Number],
    index: '2dsphere',
  },
  destinationLoc: {
    required: true,
    type: [Number],
    index: '2dsphere',
  },
  createdOn: {
    type: Date,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
  },
  delayTolerance: Number,
  driverId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Driver',
  },
  carId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Car',
  },
  passengers: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
});
rideSchema
  .set('toJSON', {
    virtuals: true,
  });
// virtuals
rideSchema
  .virtual('departureLocation')
  // arrow function does not bind to correct context
  .set(function set(departureLocation) {
    this.departureLoc = [
      departureLocation.lng,
      departureLocation.lat,
    ];
  })
  // arrow function does not bind to correct context
  .get(function get() {
    return {
      lat: this.departureLoc[1],
      lng: this.departureLoc[0],
    };
  });

rideSchema
  .virtual('destinationLocation')
  // arrow function does not bind to correct context
  .set(function set(destinationLocation) {
    this.destinationLoc = [
      destinationLocation.lng,
      destinationLocation.lat,
    ];
  })
  // arrow function does not bind to correct context
  .get(function get() {
    return {
      lat: this.destinationLoc[1],
      lng: this.destinationLoc[0],
    };
  });
const RideModel = mongoose.model('Ride', rideSchema);

class Ride extends RideModel {
  getCurrentDate() {
    return moment().format();
  }
  create(cb) {
    this.createdOn = this.getCurrentDate();
    this.save(cb);
  }
  remove(cb) {
    super.remove({
      _id: this._id,
    }, cb);
  }
  assignPassenger(driver, cb) {
    async.waterfall([
      (callback) => {
        // get carId seats
        Driver.findOne({
          _id: this.driverId,
          'cars._id': this.carId,
        }, {
          'cars.$': 1,
        }, (err, existingDriver) => {
          if (err) return callback(err);
          return callback(null, existingDriver.cars[0]);
        });
      },
      (car, callback) => {
        const availability = car.availableSeats - this.passengers.length;
        if (availability <= 0) {
          return callback({
            code: 'NOAVAILABLESEATS',
            message: 'There are no more available seats in this ride',
          });
        }
        this.passengers.push(driver._id);
        return this.save((err) => callback(err));
      },
    ], err => cb(err));
  }
}

exports = module.exports = Ride;

Ride.getById = (rideId, cb) => {
  RideModel.findById(rideId, (err, ride) => {
    if (err) return cb(err);
    if (ride === null) return cb(null, null);
    return cb(null, new Ride({
      departureLocation: ride.departureLocation,
      destinationLocation: ride.destinationLocation,
      departureDate: ride.departureDate,
      fare: ride.fare,
      delayTolerance: ride.delayTolerance,
      driverId: ride.driverId,
    }));
  });
};
