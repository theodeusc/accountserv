const chai = require('chai');
const should = chai.should();
const request = require('superagent');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = 'http://localhost:8080';

describe('POST /users/authenticate', () => {
  it('should respond with true and jwt', (done) => {
    chai.request(app)
    .post('/users/authenticate')
    .send({ email: 'customer@test.com', password: '1234' })
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
});
