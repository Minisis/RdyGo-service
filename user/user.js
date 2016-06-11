'use strcit'

//credentials
if(process.env.OPENSHIFT_MONGODB_DB_URL)
  var dbConnectionString = process.env.OPENSHIFT_MONGODB_DB_URL
else var localCredentials = require('../localCredentials.js');

//database configuration
var mongoose = require('mongoose');
var options = {
  server:{
    socketOptions:{keepAlive:1} //to prevent get "connection closed" err
  }
};
mongoose.connect(dbConnectionString || localCredentials.mongo.dev.connectionString, options);

//User model
var user = require('../models/User.js');

// user class
function User(){

  this.createUser = function(data, cb){
    if(!data) return cb('you must provide user data', null);

    new user({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      IsActive: true
    }).save(function(err){
      if(err) return cb('Database connection err: ' + err);
      console.log('user saved');
      console.log(user._user);
      cd(null, "lets return the object")
    })

  };

  this.selfLogin = function(data, cb){
    cb("missing implemetation")
  };
};

module.exports = User;
