const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const waitingListSchema = new Schema({
  departureDate: String,
  pickupLoc: {
    required: true,
    type: [Number],
    index: '2dsphere',
  },
  dropOffLoc: {
    required: true,
    type: [Number],
    index: '2dsphere',
  },
  driverId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
  isActive: Boolean,
});

waitingListSchema.set('toJSON', { virtuals: true });

  // virtuals
waitingListSchema.virtual('pickupLocation')
    // arrow function does not bind to correct context
    .set(function set(pickupLocation) {
      this.pickupLoc = [
        pickupLocation.lng,
        pickupLocation.lat,
      ];
    })
    // arrow function does not bind to correct context
    .get(function get() {
      return {
        lat: this.pickupLoc[1],
        lng: this.pickupLoc[0],
      };
    });

waitingListSchema.virtual('dropOffLocation')
    // arrow function does not bind to correct context
    .set(function set(dropOffLocation) {
      this.dropOffLoc = [
        dropOffLocation.lng,
        dropOffLocation.lat,
      ];
    })
    // arrow function does not bind to correct context
    .get(function get() {
      return {
        lat: this.dropOffLoc[1],
        lng: this.dropOffLoc[0],
      };
    });

const WatingListModel = mongoose.model('waitingList', waitingListSchema);

class WaitingList extends WatingListModel {
  getCurrentDate() {
    return moment().format();
  }

  create(cb) {
    // save waitingList
    this.createdOn = this.getCurrentDate();
    super.save(cb);
  }

  remove(cb) {
    // remove waitingList util for testing pourpose
    super.remove({
      _id: this._id,
    }, cb);
  }

  inactive(cb) {
    // set inactive waitingList
    this.isActive = false;
    this.save(cb);
  }
}

exports = module.exports = WaitingList;
