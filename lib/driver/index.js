const mongoose = require('mongoose');
const moment = require('moment');
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
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});
const DriverModel = mongoose.model('Driver', driverSchema);

class Driver extends DriverModel {
  getCurrentDate() {
    return moment().format();
  }
  create(cb) {
    // save driver
    this.createdOn = this.getCurrentDate();
    this.save(cb);
  }
  remove(cb) {
    DriverModel.remove({
      _id: this._id,
    }, cb);
  }
}

exports = module.exports = Driver;

Driver.getAll = (cb) => {
  DriverModel.find({}, cb);
};
