var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const  bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    minlength: 1,
    unique: true,
    validate:{
         validator: (value)=>{
           return validator.isEmail(value);
         },
         message:'{VALUE} is not a valid Email'

    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
        access: {
          type: String,
          required: true
    }
  ,
    token: {
      type: String,
      required: true
    }
  }]
});

//To send only the email and id
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

//instance method (custom), applicable for one user
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    ///will be returned for the next promise in server.js
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
          tokens: {token}
        }
    });
};
//model method, applicable for all the users
UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e){
    return Promise.reject();
  }

  return User.findOne({
    '_id' : decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email,password) {
  var User = this;
  return User.findOne({email}).then((user)=>{
    if(!user){
      return Promise.reject();
    }

    return new Promise((resolve,reject)=>{
      //bcrypt only creates a callback so we bundled it in the new promise
       bcrypt.compare(password, user.password,(err,res)=>{
          if(res){
            resolve(user);
          }
          else{
            reject();
        }
      });
    });
  });
};
//Mongoose pre event
UserSchema.pre('save', function (next) {
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, (err,salt) => {
      bcrypt.hash(user.password, salt, (err,hash) =>{
        user.password = hash;
        next();
      });
    });
  }
  else {
    next();
  }
});
var User = mongoose.model('User', UserSchema);

  module.exports = {User};
