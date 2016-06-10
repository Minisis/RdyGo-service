var mongoose = require( 'mongoose' );

var appSchema = mongoose.Schema({
  firstName : String,
  lastName : String,
  email : String,
  date : { type : Date, default : Date.now },
  IsActive : Boolean
});

var newUser = mongoose.model('newUser', appSchema);

module.exports = newUser;
