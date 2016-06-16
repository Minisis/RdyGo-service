const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;
const async = require('async');

module.exports = (password) => ({
  seal: (cb) => {
    async.waterfall([
      (callback) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
          if (err) return callback(err);
          return callback(null, salt);
        });
      },
      (salt, callback) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) return callback(err);
          return callback(null, hash);
        });
      },
    ], cb);
  },
  compare: (sealed, cb) => {
    bcrypt.compare(password, sealed, cb);
  },
});
