const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

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
      "notApproved"]
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback){
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.updateUserById = function(user, callback){
  User.findByIdAndUpdate({_id: user._id}, user, (err, newUser) => {
    if(err) throw err;
    User.findOne({_id: user.id}, callback);
  });
}

module.exports.getAllUsersByRole = function(isRole, callback){
  const query = {hasRoles:{$in: isRole}};
  User.find(query, callback);
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

module.exports.cleanArray = function(users, callback){

  var cleanUsers = [];
  for(var i = 0; i < users.length; i++){

    cleanUsers.push({
          id: users[i]._id,
          name: users[i].name,
          email: users[i].email,
          address: users[i].address,
          hasRoles: users[i].hasRoles
        });
  }

  callback(null, cleanUsers);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
