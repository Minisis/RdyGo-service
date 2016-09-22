const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const carSchema = new Schema({
  carName: String,
  availableSeats: Number,
  createdOn: { type: Date, default: Date.now },
});
const driverSchema = new Schema({
  email: String,
  name: String,
  city: String,
  phoneNumber: String,
  cars: [carSchema],
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
  isActive: Boolean,
});
const DriverModel = mongoose.model('Driver', driverSchema);

class Driver extends DriverModel {
  getCurrentDate() {
    return moment().format();
  }
  create(cb) {
    // save driver
    this.createdOn = this.getCurrentDate();
    super.save(cb);
  }
  remove(cb) {
    super.remove({
      _id: this._id,
    }, cb);
  }
  inactive(cb) {
    this.isActive = false;
    this.save(cb);
  }
  createCar(carData, cb) {
    this.cars.push(carData);
    this.save(cb);
  }
  getCars() {
    return this.cars;
  }
}

exports = module.exports = Driver;

Driver.getAll = (cb) => {
  DriverModel.find({}, cb);
};

Driver.getByUserId = (userId, cb) => {
  const query = { userId: [userId] };
  DriverModel.find(query, (err, driverModel) => {
    if (err) return cb(err);
    if (driverModel.length === 0) {
      return cb(null, null);
    }
    const driver = new Driver({
      _id: driverModel[0]._id,
      email: driverModel[0].email,
      name: driverModel[0].name,
      city: driverModel[0].city,
      phoneNumber: driverModel[0].phoneNumber,
      carIds: driverModel[0].carIds,
      userId: driverModel[0].userId,
      isActive: driverModel[0].isActive,
    });
    return cb(err, driver);
  });
};
