const User = require('./user');
const Driver = require('./driver');
const Ride = require('./ride');
const mongoose = require('mongoose');
const core = {
  User,
  Driver,
  Ride,
};
// connect to mongo function
core.connect = function connect(opts) {
  mongoose.connect(`mongodb://${opts.server}:${opts.port}/${opts.db}`);
  return mongoose.connection;
};
// disconect to mongo function
core.disconect = function disconect(cb) {
  mongoose.connection.close(cb);
};
module.exports = core;
