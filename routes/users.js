const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {

  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address
  });

// Check if user already exists
  User.getUserByEmail(newUser.email, (err, user)=>{

    if(err) return res.json({success: false, msg:'Something went wrong.'});
    // If user doesn't exist
    if(!user){

      if(!User.validateEmail(newUser.email)){

        return res.json({success: false, msg:'Email format is incorrect.'});
      } else {

        User.addUser(newUser, (err, user) =>{
          if(err){
            return res.status(500).json({success: false, msg:'Failed to register user'});
          } else {

            return res.status(201).json({success: true, msg:'User registered'});
          }
        });
      }
    } else {

      return res.json({success: false, msg: 'Email already in use.'});
    }
  })
});

// Authenticate
router.post('/authenticate', (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email,  (err, user) => {

    if(err) return res.json({success: false, msg: 'Something went wrong.'});
    if(!user){

      return res.json({success: false, msg: 'User or password incorrect.'});
    }
    User.comparePassword(password, user.password, (err, isMatch) => {

      if(err) throw err;
      if(isMatch){

        const token = jwt.sign({payload:
          {user:{
            id: user._id,
            hasRoles: user.hasRoles
        }}},
          config.secret, {
            expiresIn: 1800 //30 minutes
        });

        return res.status(200).json({success: true, token: 'JWT ' + token});
      } else {

        return res.json({success: false, msg: 'User or password incorrect.'});
      }
    });
  });
});

// Profile From JWT
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  return res.status(200).json({success: true,
    user:
      {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        hasRoles: req.user.hasRoles,
        address: req.user.address
      }
  });
});

// Staff/Management request a profile
router.get('/profile/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  User.getUserById(req.params.id,  (err, user) => {

    if(err) return res.status(404).json({success: false, msg: 'User not found'});
    if(!(req.user.hasRoles.includes('isStaff') && user.hasRoles.includes('isCustomer')
      || req.user.hasRoles.includes('isManagement'))) {

        return res.json({success: false, msg: 'Unauthorized.'});
      } else {

        return res.status(200).json({success: true, user: user});
      }
  });
});

// Staff Toggles Customer Approval
router.put('/profile/:id/toggleBuy', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  User.getUserById(req.params.id,  (err, user) => {

    if(err) return res.status(404).json({success: false, msg: 'User not found'});
    if(!(req.user.hasRoles.includes('isStaff') && user.hasRoles.includes('isCustomer'))) {

        return res.json({success: false, msg: 'Unauthorized.'});
      } else {

        User.toggleBuy(user, (err, user) => {

          if(err) return res.json({success: false, msg: "Something went wrong."});
          return res.status(200).json({success: true, user});
        });
      }
  });
});

// Management Updates Staff Permissions
router.put('/profile/:id/editPermissions', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  if(req.body === undefined || req.body.hasRoles.constructor !== Array){

    return res.status(400).json({success: false, msg:"Body format not supported."});
  }

  User.getUserById(req.params.id,  (err, user) => {

    if(err) return res.status(404).json({success: false, msg: 'User not found'});
    if(!(req.user.hasRoles.includes('isManagement') && user.hasRoles.includes('isStaff'))) {

        return res.json({success: false, msg: 'Unauthorized.'});
      } else {

        User.editPermissions(user, req.body.hasRoles, (err, user) => {

          if(err) return res.json({success: false, msg: "Something went wrong."});
          return res.status(200).json({success: true, user});
        });
      }
  });
});

// User Edits Profile
router.put('/profile/edit/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  if(!req.user._id.equals(req.params.id)) {

    return res.json({success: false, msg: 'Unauthorized.'});
  } else {

    // Check if email already exists
    if(req.body.email !== undefined && req.body.email != req.user.email){

      User.getUserByEmail(req.body.email,  (err, user) => {

        if(err) return res.json({success: false, msg: 'Something went wrong.'});
        if(user) {

          return res.json({success: false, msg: 'Email already in use.'});
        }
      });
    } else {

      var user = {
        _id: req.params.id,
        name: req.body.name || req.user.name,
        email: req.body.email || req.user.email,
        address: req.body.address || req.user.address
      };
      if(!User.validateEmail(user.email)) {

        return res.json({success: false, msg: 'Invalid email format.'});
      }
      User.updateUser(user, (err, user) => {

        if(err) return res.status(404).json({success: false, msg: "User not found."});
        return res.status(200).json({success: true, user});
      });
      }
    }
});

// Get All Customers
router.get('/show/customers', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    if(!req.user.hasRoles.includes('isStaff')){

      return res.status(401).json({success: false, msg: 'Unauthorized.'});
    } else {

    User.getAllUsersByRole( ["isCustomer"], (err, users) => {

      if (err) throw err;
      if(!users){

        return res.status(404).json({success: false, msg: 'Customers not found.'});
      }
      return res.status(200).json({success: true, users: users});
    });
    }
});

// Get All Staff
router.get('/show/staff', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    if(!req.user.hasRoles.includes('isManagement')){

      return res.status(401).json({success: false, msg: 'Unauthorized.'});
    } else {

    User.getAllUsersByRole( ["isStaff"], (err, users) => {

      if (err) throw err;
      if(!users){

        return res.status(404).json({success: false, msg: 'Staff not found.'});
      }
      return res.status(200).json({success: true, users: users});
    });
    }
});

module.exports = router;
