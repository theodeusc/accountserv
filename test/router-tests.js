const chai = require('chai');
const should = chai.should();
const request = require('superagent');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/database').get(process.env.NODE_ENV);
chai.use(chaiHttp);
const app = 'http://localhost:8080';

describe('Mongoose connection', () => {

  beforeEach(function (done) {
    if (mongoose.connection.readyState === 0) {

      mongoose.connect(config.database, {useMongoClient: true}, function (err) {
        if (err) {
          throw err;
        }
        return done();
      });
    }
    else {
      return done();
    }
  });

  afterEach(function (done) {
    mongoose.disconnect();
    return done();
  });

  describe('POST /users/authenticate', () => {

    let testUser = new User({name: 'test', email: 'customer@test.com', password: '1234'});
    var unhashedPass = testUser.password;

    beforeEach((done) => {

      User.addUser(testUser, ()=> {
        done();
      });
    });

    afterEach((done) => {

      testUser.remove( ()=> {
        done();
      });
    });

    it('should respond with true and jwt', (done) => {

      chai.request(app)
      .post('/users/authenticate')
      .send({ email: testUser.email, password: unhashedPass })
      .end((err, res) => {
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be truthy
        res.body.success.should.equal(true);
        // second field should be token
        res.body.should.include.key('token');
        done();
      });
    });

    it('should respond with false and error message, when given incorrect password', (done) => {

      chai.request(app)
      .post('/users/authenticate')
      .send({ email: testUser.email, password: 'wrongPassword' })
      .end((err, res) => {
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be falsy
        res.body.success.should.equal(false);
        // second field should be token
        res.body.should.include.key('msg');
        done();
      });
    });

    it('should respond with false and error message, when given incorrect email', (done) => {

      chai.request(app)
      .post('/users/authenticate')
      .send({ email: 'wrong@email.com', password: testUser.password })
      .end((err, res) => {
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be falsy
        res.body.success.should.equal(false);
        // second field should be token
        res.body.should.include.key('msg');
        done();
      });
    });

    it('should respond with false and error message, when given no password or email', (done) => {

      chai.request(app)
      .post('/users/authenticate')
      .send({ email: '', password: '' })
      .end((err, res) => {
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be falsy
        res.body.success.should.equal(false);
        // second field should be token
        res.body.should.include.key('msg');
        done();
      });
    });

    it('should respond with false and error message, when given null body', (done) => {

      chai.request(app)
      .post('/users/authenticate')
      .send(null)
      .end((err, res) => {
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be falsy
        res.body.success.should.equal(false);
        // second field should be token
        res.body.should.include.key('msg');
        done();
      });
    });
  });

  describe('GET /users/profile', () => {

    let testUser = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isCustomer'],
                    email: 'customer@test.com'});

    var token = generateToken(testUser, testUser.hasRoles);

    beforeEach((done) => {

      testUser.save( ()=> {done();});
    });

    afterEach((done) => {

      testUser.remove( ()=> {done();});
    })

    it('should respond with true and user profile', (done) => {

      chai.request(app)
      .get('/users/profile')
      .set('Authorization', token)
      .end((err, res) => {
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be truthy
        res.body.success.should.equal(true);
        // should include all user fields
        res.body.user.should.include.keys('_id', 'email', 'name', 'address', 'hasRoles');
        done();
      });
    });

    it('should respond with Unauthorized when given wrong token', (done) => {

      chai.request(app)
      .get('/users/profile')
      .set('Authorization', token + 'a')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given no token', (done) => {

      chai.request(app)
      .get('/users/profile')
      .set('Authorization', '')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when Authorization header is not set', (done) => {

      chai.request(app)
      .get('/users/profile')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });
  });

  describe('GET /users/show/customers', () => {

    let testStaff = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isStaff'],
                    email: 'staff@test.com'});

    let testCustomer = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isCustomer'],
                    email: 'customer@test.com'});

    var staffToken = generateToken(testStaff, testStaff.hasRoles);
    var customerToken = generateToken(testCustomer, testCustomer.hasRoles);

    beforeEach((done) => {

      testStaff.save( ()=> {
        testCustomer.save(()=> {done();});
      });
    });

    afterEach((done) => {

      testStaff.remove( ()=> {
        testCustomer.remove(()=> {done();});
      });
    })

    it('should respond with true and customer profiles', (done) => {

      chai.request(app)
      .get('/users/show/customers')
      .set('Authorization', staffToken)
      .end((err, res) => {
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be truthy
        res.body.success.should.equal(true);
        // should include all user fields
        res.body.users[0].should.include.keys('_id', 'email', 'name', 'address', 'hasRoles');
        done();
      });
    });

    it('should respond with Unauthorized when given wrong token', (done) => {

      chai.request(app)
      .get('/users/show/customers')
      .set('Authorization', staffToken + 'a')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given valid customer token', (done) => {

      chai.request(app)
      .get('/users/show/customers')
      .set('Authorization', customerToken)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given no token', (done) => {

      chai.request(app)
      .get('/users/show/customers')
      .set('Authorization', '')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when Authorization header is not set', (done) => {

      chai.request(app)
      .get('/users/show/customers')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });
  });

  describe('GET /users/show/staff', () => {

    let testStaff = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isStaff'],
                    email: 'staff@test.com'});

    let testManager = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isManagement'],
                    email: 'manager@test.com'});

    var staffToken = generateToken(testStaff, testStaff.hasRoles);
    var managerToken = generateToken(testManager, testManager.hasRoles);

    beforeEach((done) => {

      testStaff.save( ()=> {
        testManager.save(()=> {done();});
      });
    });

    afterEach((done) => {

      testStaff.remove( ()=> {
        testManager.remove(()=> {done();});
      });
    });

    it('should respond with true and staff profiles', (done) => {

      chai.request(app)
      .get('/users/show/staff')
      .set('Authorization', managerToken)
      .end((err, res) => {
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be truthy
        res.body.success.should.equal(true);
        // should include all user fields
        res.body.users[0].should.include.keys('_id', 'email', 'name', 'address', 'hasRoles');
        done();
      });
    });

    it('should respond with Unauthorized when given wrong token', (done) => {

      chai.request(app)
      .get('/users/show/staff')
      .set('Authorization', managerToken + 'a')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given valid staff token', (done) => {

      chai.request(app)
      .get('/users/show/staff')
      .set('Authorization', staffToken)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given no token', (done) => {

      chai.request(app)
      .get('/users/show/staff')
      .set('Authorization', '')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when Authorization header is not set', (done) => {

      chai.request(app)
      .get('/users/show/staff')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });
  });

  describe('GET /users/profile/:id', () => {

    let testStaff = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isStaff'],
                    email: 'staff@test.com'});

    let testCustomer = new User({
                    name: 'test',
                    address: 'testaddress',
                    password: '1234',
                    hasRoles: ['isCustomer'],
                    email: 'customer@test.com'});


    var staffToken = generateToken(testStaff, testStaff.hasRoles);
    var customerToken = generateToken(testCustomer, testCustomer.hasRoles);

    beforeEach((done) => {

      testStaff.save( ()=> {
        testCustomer.save( ()=> {done();});
      });
    });

    afterEach((done) => {

      testStaff.remove( ()=> {
        testCustomer.remove( ()=> {done();});
      });
    });

    it('should respond with true and customer profile', (done) => {

      chai.request(app)
      .get('/users/profile/' + testCustomer._id)
      .set('Authorization', staffToken)
      .end((err, res) => {
        // there should be a 200 status code
        res.status.should.equal(200);
        // the response should be JSON
        res.type.should.equal('application/json');
        // success should be truthy
        res.body.success.should.equal(true);
        // should include all user fields
        res.body.user.should.include.keys('_id', 'email', 'name', 'address', 'hasRoles');
        done();
      });
    });

    it('should respond with Unauthorized when given wrong token', (done) => {

      chai.request(app)
      .get('/users/profile/' + testCustomer._id)
      .set('Authorization', staffToken + 'a')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given valid customer token', (done) => {

      chai.request(app)
      .get('/users/profile/' + testCustomer._id)
      .set('Authorization', customerToken)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when staff tries to view another staff', (done) => {

      chai.request(app)
      .get('/users/profile/' + testStaff._id)
      .set('Authorization', staffToken)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when customer tries to view staff', (done) => {

      chai.request(app)
      .get('/users/profile/' + testStaff._id)
      .set('Authorization', customerToken)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when given no token', (done) => {

      chai.request(app)
      .get('/users/profile/' + testCustomer._id)
      .set('Authorization', '')
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });

    it('should respond with Unauthorized when Authorization header is not set', (done) => {

      chai.request(app)
      .get('/users/profile/' + testCustomer._id)
      .end((err, res) => {
        // there should be a 401 status code
        res.status.should.equal(401);
        done();
      });
    });
  });
});


function generateToken(user, hasRoles){

  return 'JWT ' + jwt.sign({payload:
    {user:{
      id: user._id,
      hasRoles: hasRoles
      }
    }
  },
    config.secret, {
      expiresIn: 1800 //30 minutes
  });
}
