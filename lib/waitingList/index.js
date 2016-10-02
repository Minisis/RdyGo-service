const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const member = new Schema({
  driverId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  departureTime: Date,
  createdOn: { type: Date, default: Date.now },
});
const waitingListSchema = new Schema({
  departureDate: String,
  origin: String,
  destination: String,
  driverId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  members: [member],
  createdOn: { type: Date, default: Date.now },
  isActive: Boolean,
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

  // add new member to the  waitingList
  addMember(memberData, cb) {
    this.members.push(memberData);
    super.save(cb);
  }

  inactive(cb) {
    // set inactive waitingList
    this.isActive = false;
    super.save(cb);
  }
}

exports = module.exports = WaitingList;
