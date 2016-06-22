const User = require('./user');
const Driver = require('./driver');
const mongoose = require('mongoose');
const core = {
  User,
  Driver,
};
// connect to mongo function
core.connect = function connect(opts) {
  mongoose.connect(`mongodb://${opts.server}:${opts.port}/${opts.db}`);
  return mongoose.connection;
};
// disconect to mongo function
core.disconect = function disconect(cb) {
  // Ouput 0 = disconected, 1 = connected, 2 = connecting, 3 = disconecting
  if (mongoose.connection.readyState === 1)
    mongoose.connection.close();
  cb();
};
module.exports = core;
