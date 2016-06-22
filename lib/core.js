const User = require('./user');
const mongoose = require('mongoose');
const core = {
  User,
};
// connect to mongo function
core.connect = function connect(opts) {
  mongoose.connect(`mongodb://${opts.server}:${opts.port}/${opts.db}`);
  return mongoose.connection;
};
module.exports = core;
