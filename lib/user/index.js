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
  tokens: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Token',
    },
  ],
});
const UserModel = mongoose.model('User', userSchema);
const TokenModel = mongoose.model('Token', tokenSchema);

class User extends UserModel {
  constructor(opts) {
    super(opts);
    this.device = opts.device;
    this.token = null;
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
  compareToken({ password, sealed, cb }) {
    bcrypt.compare(password, sealed, cb);
    return this;
  }
  createToken(cb) {
    iron.seal({
      username: this.username,
      password: this.password,
    }, this.password, iron.defaults, cb);
    return this;
  }
  create(cb) {
    async.series([
      (callback) => {
        // encrypt password..
        this.sealPassword(callback);
      },
      (callback) => {
        // create token...
        this.createToken((err, tkn) => {
          if (err) return callback(err);
          this.tkn = tkn;
          return callback(null);
        });
      },
      (callback) => {
        // save user
        this.createdOn = this.getCurrentDate();
        this.save(callback);
      },
      (callback) => {
        const token = new TokenModel({
          tkn: this.tkn,
          device: this.device,
          createdBy: this._id,
          createdOn: this.getCurrentDate(),
        });
        this.token = token;
        token.save(callback);
      },
      (callback) => {
        this.tokens.push(this.token);
        this.save(callback);
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

User.getAll = (cb) => {
  UserModel.find({}, cb);
};
