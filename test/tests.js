const sinon = require('sinon');
const User = require('../models/user');

var sandbox = sinon.createSandbox();

describe('User.getUserById', () => {

  beforeEach(() => {

    sandbox.stub(User, 'findById');
  });
  afterEach(() => {

    sandbox.restore();
  })
  it('should call findById exactly once', () =>{

    User.getUserById({ _id: 'test' }, () => { });
    sandbox.assert.calledOnce(User.findById);
  });

  it('should call findById with correct id', () => {

    var query = 'id';
    var expectedQuery = 'id';
    User.getUserById(query, () => { });
    sandbox.assert.calledWith(User.findById, expectedQuery);
  });

  it('should call findById with null query', () => {

    var query = null;
    var expectedQuery = null;
    User.getUserById(query, () => { });
    sandbox.assert.calledWith(User.findById, expectedQuery);
  });
});

describe('User.getUserByEmail', () => {

  beforeEach(() => {

    sandbox.stub(User, 'findOne');
  });
  afterEach(() => {

    sandbox.restore();
  })
  it('should call findOne exactly once', () =>{

    User.getUserByEmail('test@email.com', () => { });
    sandbox.assert.calledOnce(User.findOne);
  });

  it('should call findOne with correct email', () => {

    var query = 'test@email.com';
    var expectedQuery = {email: 'test@email.com'};
    User.getUserByEmail(query, () => { });
    sandbox.assert.calledWith(User.findOne, expectedQuery);
  });

  it('should call findOne with null email', () => {

    var query = null;
    var expectedQuery = {email: null};
    User.getUserByEmail(query, () => { });
    sandbox.assert.calledWith(User.findOne, expectedQuery);
  });
});

describe('User.updateUser', () => {

  beforeEach(() => {
    sandbox.stub(User, 'findByIdAndUpdate');
    sandbox.stub(User, 'findOne');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should call findOne exactly once', () =>{

    var testUser = {name: 'test', email:'test', _id: 'id'};
    User.updateUser(testUser, User.findOne({_id : testUser._id}, testUser, () => {}));
    sandbox.assert.calledOnce(User.findOne);
  });

  it('should call findOne with correct id', () =>{

    var testUser = {name: 'test', email:'test', _id: 'id'};
    var expectedQuery = {_id: testUser._id};
    User.updateUser(testUser, User.findOne({_id: testUser._id}, testUser, () => {}));
    sandbox.assert.calledWith(User.findOne, expectedQuery);
  });

  it('should call findOne with null id', () =>{

    var testUser = {name: 'test', email:'test', _id: null};
    var expectedQuery = {_id: null};
    User.updateUser(testUser, User.findOne({_id: testUser._id}, testUser, () => {}));
    sandbox.assert.calledWith(User.findOne, expectedQuery);
  });

  it('should not call findOne after throwing err', () =>{

    var testUser = {name: 'test', email:'test', _id: null};
    var callback = sandbox.stub();
    callback.throws("Error");
    User.updateUser(testUser, callback);
    sandbox.assert.notCalled(User.findOne);
  });

  it('should call findByIdAndUpdate exactly once', () =>{

    var testUser = {name: 'test', email: 'test', _id: 'id'};
    User.updateUser(testUser, () => {});
    sandbox.assert.calledOnce(User.findByIdAndUpdate);
  });

  it('should call findByIdAndUpdate with correct args', () =>{

    var testUser = {name: 'test', email: 'test', _id: 'id'};
    var expectedArg1 = {_id: 'id'};
    var expectedArg2 = testUser;
    User.updateUser(testUser, () => {});
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should call findByIdAndUpdate with undefined id', () =>{

    var testUser = {name: 'test', email: 'test'};
    var expectedArg1 = {_id: undefined};
    User.updateUser(testUser, () => {});
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1);
  });
})

describe('User.toggleBuy', () => {

  beforeEach(() => {
    sandbox.stub(User, 'findByIdAndUpdate');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should call findByIdAndUpdate exactly once', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    User.toggleBuy(testUser);
    sandbox.assert.calledOnce(User.findByIdAndUpdate);
  });

  it('should call findByIdAndUpdate with correct id', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var expectedArg1 = {_id: 'test'};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1);
  });

  it('should call findByIdAndUpdate with null id', () =>{

    var testUser = {_id: null, hasRoles: ["Test"]};
    var expectedArg1 = {_id: null};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1);
  });

  it('should remove newCustomer from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove notApproved from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should add notApproved to roles', () =>{

    var testUser = {_id: 'test', hasRoles: []};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["notApproved"]};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove notApproved and newCustomer from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should not change any roles, apart from newCustomer and notApproved', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "notApproved", "isStaff", "isManagement"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["isStaff", "isManagement"]};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of newCustomer', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "newCustomer", "notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of notApproved', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "notApproved", "notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of both notApproved and newCustomer', () =>{

    var testUser = {_id: 'test', hasRoles: ["newCustomer", "newCustomer", "notApproved", "notApproved"]};
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: []};
    User.toggleBuy(testUser);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });
})

describe('User.editPermissions', () => {

  beforeEach(() => {
    sandbox.stub(User, 'findByIdAndUpdate');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should call findByIdAndUpdate exactly once', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["Test"];
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledOnce(User.findByIdAndUpdate);
  });

  it('should call findByIdAndUpdate with correct id', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["Test"];
    var expectedArg1 = {_id: 'test'};
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1);
  });

  it('should call findByIdAndUpdate with null id', () =>{

    var testUser = {_id: null, hasRoles: ["Test"]};
    var testRoles = ["Test"];
    var expectedArg1 = {_id: null};
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1);
  });

  it('should not change any roles other than the modifiable ones', () =>{

    var testUser = {_id: 'test', hasRoles: ["isStaff", "isManagement"]};
    var testRoles = ["Test"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["isStaff", "isManagement"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should add canBuy to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canBuy"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canBuy"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should add canMessage to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canMessage"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canMessage"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should add both canBuy and canMessage to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canBuy", "canMessage"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canBuy", "canMessage"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove canBuy from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canBuy"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove canMessage from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canMessage"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove both canBuy and canMessage from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canMessage", "canBuy"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of canBuy from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canBuy", "canBuy"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of canMessage from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canMessage", "canMessage"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should remove multiple instances of both canBuy and canMessage from roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test", "canBuy", "canBuy", "canMessage", "canMessage"]};
    var testRoles = [];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should not add multiple instances of canBuy to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canBuy", "canBuy"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canBuy"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should not add multiple instances of canMessage to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canMessage", "canMessage"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canMessage"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });

  it('should not add multiple instances of either canBuy or canMessage to roles', () =>{

    var testUser = {_id: 'test', hasRoles: ["Test"]};
    var testRoles = ["canBuy", "canBuy", "canMessage", "canMessage"];
    var expectedArg1 = {_id: 'test'};
    var expectedArg2 = {_id: 'test', hasRoles: ["Test", "canBuy", "canMessage"]}
    User.editPermissions(testUser, testRoles);
    sandbox.assert.calledWith(User.findByIdAndUpdate, expectedArg1, expectedArg2);
  });
})

describe('User.getAllUsersByRole', () => {

  beforeEach(() => {
    sandbox.stub(User, 'find');
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should call find exactly once', () =>{

    var query = "test";
    User.getAllUsersByRole(query);
    sandbox.assert.calledOnce(User.find);
  });

  it('should call find with correct query', () =>{

    var query = "test";
    var expectedQuery = {hasRoles:{$in: "test"}};
    User.getAllUsersByRole(query);
    sandbox.assert.calledWith(User.find, expectedQuery);
  });

  it('should call find with null query', () =>{

    var query = null;
    var expectedQuery = {hasRoles:{$in: null}};
    User.getAllUsersByRole(query);
    sandbox.assert.calledWith(User.find, expectedQuery);
  });

  it('should call find with array', () =>{

    var query = ["isCustomer", "isStaff"];
    var expectedQuery = {hasRoles:{$in: ["isCustomer", "isStaff"]}};
    User.getAllUsersByRole(query);
    sandbox.assert.calledWith(User.find, expectedQuery);
  });
})
