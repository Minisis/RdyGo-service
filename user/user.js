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
var NewUser = require('../models/newUser.js');

// user class
function User(){

  this.createUser = function(data, cb){
    if(!data) return cb('you must provide user data', null);

    new NewUser({
      firstName: firstName,
      lastName: lastName,
      email: email,
      IsActive: true
    }).save(function(err){
      if(err) return cb('Database connection err: ' + err)
    })

  };

  this.selfLogin = function(data, cb){
    cb("missing implemetation")
  };
};

module.exports = User;
