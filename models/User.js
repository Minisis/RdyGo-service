var mongoose = require( 'mongoose' );

var appSchema = mongoose.Schema({
  firstName : String,
  lastName : String,
  email : String,
  date : { type : Date, default : Date.now },
  IsActive : Boolean
});

var User = mongoose.model('User', appSchema);

module.exports = User;
