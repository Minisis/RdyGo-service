const mongoose = require('mongoose');
const moment = require('moment');
const iron = require('iron');
const async = require('async');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 12;
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
  tkn: {
    unique: true,
    type: String,
  },
  device: {
    osVersion: String,
    model: String,
  },
  createdOn: {
    type: Date,
    default: Date.now,
    expires: '7d',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});
const userSchema = new Schema({
  username: String,
  password: String,
  createdOn: {
    type: Date,
    default: Date.now,
  },
});
const UserModel = mongoose.model('User', userSchema);
const TokenModel = mongoose.model('Token', tokenSchema);

class User extends UserModel {
  constructor(opts) {
    super(opts);
    this.device = opts.device;
  }
  getCurrentDate() {
    return moment().format();
  }
  sealPassword(cb) {
    async.waterfall([
      (callback) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, callback);
      },
      (salt, callback) => {
        bcrypt.hash(this.password, salt, callback);
      },
    ], (err, sealed) => {
      if (err) return cb(err);
      this.password = sealed;
      return cb(null, sealed);
    });
  }
  createToken(device, cb) {
    async.waterfall([
      (callback) => {
        iron.seal({
          username: this.username,
          password: this.password,
        }, this.password, iron.defaults, callback);
      },
      (tkn, callback) => {
        const token = new TokenModel({
          tkn,
          device,
          createdBy: this._id,
          createdOn: this.getCurrentDate(),
        });
        token.save(callback);
      },
    ], cb);
  }
  create(cb) {
    async.series([
      (callback) => {
        this.createdOn = this.getCurrentDate();
        // encrypt password..
        this.sealPassword(callback);
      },
      (callback) => {
        this.save(callback);
      },
      (callback) => {
        // create token...
        this.createToken(this.device, callback);
      },
    ], cb);
  }
  getTokens(cb) {
    TokenModel
      .find({
        createdBy: this._id,
      })
      .populate('createdBy', 'username')
      .exec(cb);
  }
  remove(cb) {
    async.series([
      (callback) => {
        TokenModel.remove({
          createdBy: this._id,
        }, callback);
      },
      (callback) => {
        UserModel.remove({
          _id: this._id,
        }, callback);
      },
    ], cb);
  }
}

exports = module.exports = User;

User.getAll = (cb) => UserModel.find({}, cb);

User.getByCredentials = (credentials, cb) => {
  async.waterfall([
    (callback) => {
      // get user model by username
      UserModel.findOne({
        username: credentials.username,
      }, callback);
    },
    (userMongo, callback) => {
      if (userMongo === null) return callback(null, null);
      return bcrypt.compare(credentials.password, userMongo.password, (err, result) => {
        if (err) return callback(err);
        if (result === false) return callback(null, null);
        return callback(null, new User({
          username: userMongo.username,
          password: userMongo.password,
          _id: userMongo._id,
        }));
      });
    },
  ], cb);
};

User.getByToken = (token, cb) => {
  TokenModel
    .findOne({
      tkn: token,
    })
    .populate('createdBy')
    .exec((err, existingToken) => {
      if (err) return cb(err);
      if (existingToken === null) return cb(null, null);
      return cb(null, new User({
        username: existingToken.createdBy.username,
        password: existingToken.createdBy.password,
        _id: existingToken.createdBy._id,
      }));
    });
};
