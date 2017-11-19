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

    if(err) throw err;
    // If user doesn't exist
    if(!user){
      User.addUser(newUser, (err, user) =>{
        if(err){
          res.status(500).json({success: false, msg:'Failed to register user'});
        } else {
          res.status(201).json({success: true, msg:'User registered'});
        }
      })
    } else {
      res.status(403).json({success: false, msg: 'Email already in use.'});
    }
  })
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.getUserByEmail(email,  (err, user) => {
    if(err) throw err;
    if(!user){
      return res.status(404).json({success: false, msg: 'User not found'});
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

      res.status(200).json({success: true, token: 'JWT ' + token});
      } else {
        return res.status(401).json({success: false, msg: 'Wrong password.'});
      }
    });
  });
});

// Profile From JWT
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  res.status(200).json({success: true,
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
    if(err) throw err;
    if(!user){
      return res.status(404).json({success: false, msg: 'User not found'});
    }
    if(!(req.user.hasRoles.includes('isStaff') && user.hasRoles.includes('isCustomer')
      || req.user.hasRoles.includes('isManagement'))) {
        return res.status(401).json({success: false, msg: 'Unauthorized.'});
      } else {
        var cleanUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
          hasRoles: user.hasRoles
        };

        return res.status(200).json({success: true, user: cleanUser});
      }
  });
});

// User Edits Profile
router.put('/profile/edit/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {

  if(!req.user._id.equals(req.params.id)) {

    return res.status(401).json({success: false, msg: 'Unauthorized.'});
  } else {
    var user = {
      _id: req.params.id,
      name: req.body.name || req.user.name,
      email: req.body.email || req.user.email,
      address: req.body.address || req.user.address
    };
    User.updateUserById(user, (err, newUser) => {
      if(err) throw err;
      return res.status(200).json({success: true, user});
    });
  }
});


// Get All Customers
router.get('/show/customers', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    if(!req.user.hasRoles.includes('isStaff')){

      return res.status(401).json({success: false, msg: 'Unauthorized.'});
    } else {
    User.getAllCustomers( ["isCustomer"], (err, users) => {
      if (err) throw err;
      if(!users){
        return res.status(404).json({success: false, msg: 'Customers not found.'});
      }

      User.cleanArray(users, (err, cleanUsers) => {
        if(err) throw err;
        return res.status(200).json({success: true, users: cleanUsers});
      });
    });
    }
});

// Get All Staff
router.get('/show/staff', passport.authenticate('jwt', {session:false}), (req, res, next) => {

    if(!req.user.hasRoles.includes('isManagement')){

      return res.status(401).json({success: false, msg: 'Unauthorized.'});
    } else {
    User.getAllCustomers( ["isManagement"], (err, users) => {
      if (err) throw err;
      if(!users){
        return res.status(404).json({success: false, msg: 'Staff not found.'});
      }

      User.cleanArray(users, (err, cleanUsers) => {
        if(err) throw err;
        return res.status(200).json({success: true, users: cleanUsers});
      });
    });
    }
});


module.exports = router;
