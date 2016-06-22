const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const Schema = mongoose.Schema;
const driverSchema = new Schema({
  email: String,
  name: String,
  city: String,
  phoneNumber: String,
  createdOn: {
    type: Date,
    default: Date.now,
  },
});
const DriverModel = mongoose.model('Driver', driverSchema);

class Driver extends DriverModel {
  constructor(opts) {
    super(opts);
  }
  getCurrentDate() {
    return moment().format();
  }
  create(cb) {
    async.series([
      (callback) => {
        // save driver
        this.createdOn = this.getCurrentDate();
        this.save(callback);
      },
    ], cb);
  }
  remove(cb) {
    async.series([
      (callback) => {
        DriverModel.remove({
          _id: this._id,
        }, callback);
      },
    ], cb);
  }
}

exports = module.exports = Driver;

Driver.getAll = (cb) => {
  DriverModel.find({}, cb);  
};
