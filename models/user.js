const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const allPermissions = ["canBuy", "canMessage"];

// User Schema
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  hasRoles: {
    type: [String],
    default: [
      "isCustomer",
      "notApproved",
      "newCustomer"]
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
  User.findById(id, 'name email address hasRoles' , callback);
}

module.exports.getUserByEmail = function(email, callback){
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.updateUser = function(user, callback){

  User.findByIdAndUpdate({_id: user._id}, user, (err, newUser) => {
    if(err) throw err;

    User.findOne({_id: user._id}, 'name email address hasRoles', callback);
  });
}

module.exports.toggleBuy = function (user, callback){

  // if customer is new, remove new customer role
  if(user.hasRoles.includes('newCustomer')){
    user.hasRoles = user.hasRoles.filter(e => e !== 'newCustomer');
  }

  if(user.hasRoles.includes('notApproved')){
    user.hasRoles = user.hasRoles.filter(e => e !== 'notApproved');
  } else {
    user.hasRoles.push('notApproved');
  }

  User.findByIdAndUpdate({_id: user._id}, user, (err, user) => {
    if(err) throw err;

    User.findOne({_id: user._id}, 'name email address hasRoles', callback);
  });
}

module.exports.editPermissions = function (user, hasRoles, callback){

  for(var i in allPermissions){
    let role = allPermissions[i];

    user.hasRoles = user.hasRoles.filter(e => e !== role);

    if(hasRoles.includes(role)){
      user.hasRoles.push(role);
    }
  }
  User.findByIdAndUpdate({_id: user._id}, user, (err, user) => {
    if(err) throw err;
    User.findOne({_id: user._id}, 'name email address hasRoles', callback);
  });
}

module.exports.getAllUsersByRole = function(isRole, callback){

  const query = {hasRoles:{$in: isRole}};
  User.find(query, 'name email address hasRoles', callback);
}

module.exports.validateEmail = function(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
