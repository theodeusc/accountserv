'use strict';

module.exports = {
  generateRandomData
};

// Importing FakerJS (for creating random data)
const Faker = require('faker');

function generateRandomData(userContext, events, done) {

  // Generate data with Faker:
  const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
  const email = Faker.internet.exampleEmail();
  const password = Faker.internet.password();
  const address = Faker.address.streetAddress("###");

  // add variables to virtual user's context:
  userContext.vars.name = name;
  userContext.vars.email = email;
  userContext.vars.password = password;
  userContext.vars.address = address;

  // continue with executing the scenario:
  return done();
}

function generateNewAddress(userContext, events, done) {

  // Generate new address:
  const newAddress = Faker.address.streetAddress("###");

  // Add address to context
  userContext.vars.newAddress = newAddress;

  // Continue scenario
  return done();
}
