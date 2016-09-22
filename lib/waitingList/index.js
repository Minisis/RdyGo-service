// const mongoose = require('mongoose');
// const moment = require('moment');
// const Schema = mongoose.Schema;
// const watingListSchema = new Schema({
//   departureDate: String,
//   pickupLocation: {
//     required: true,
//     type: [Number],
//     index: '2dsphere',
//   },
//   dropOffLocation: {
//     required: true,
//     type: [Number],
//     index: '2dsphere',
//   },
//   driverId: {
//     type: Schema.Types.ObjectId,
//     required: true,
//   },
//   createdOn: { type: Date, default: Date.now },
//   isActive: Boolean,
// });
// watingListSchema.set('toJSON', { virtuals: true });
//   // virtuals
// watingListSchema.virtual('departureLocation')
//     // arrow function does not bind to correct context
//     .set(function set(departureLocation) {
//       this.departureLoc = [
//         departureLocation.lng,
//         departureLocation.lat,
//       ];
//     })
//     // arrow function does not bind to correct context
//     .get(function get() {
//       return {
//         lat: this.departureLoc[1],
//         lng: this.departureLoc[0],
//       };
//     });
//
// watingListSchema
//     .virtual('destinationLocation')
//     // arrow function does not bind to correct context
//     .set(function set(destinationLocation) {
//       this.destinationLoc = [
//         destinationLocation.lng,
//         destinationLocation.lat,
//       ];
//     })
//     // arrow function does not bind to correct context
//     .get(function get() {
//       return {
//         lat: this.destinationLoc[1],
//         lng: this.destinationLoc[0],
//       };
//     });
// const WatingListModel = mongoose.model('watingList', watingListSchema);
//
// class WatingList extends WatingListModel {
//   getCurrentDate() {
//     return moment().format();
//   }
//
//   create(cb) {
//     // save watingList
//     this.createdOn = this.getCurrentDate();
//     super.save(cb);
//   }
//
//   remove(cb) {
//     // remove watingList util for testing pourpose
//     super.remove({
//       _id: this._id,
//     }, cb);
//   }
//
//   inactive(cb) {
//     // set inactive watingList
//     this.isActive = false;
//     this.save(cb);
//   }
// }
//
// exports = module.exports = WatingList;
