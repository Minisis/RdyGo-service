const mongoose = require('mongoose');
const moment = require('moment');
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
