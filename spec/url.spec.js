const should = require('chai').should()
const supertest = require('supertest')
const api = supertest('http://localhost:5000')

describe('Unknown urls result in teapots', () => {
  it('returns 418 to unused urls', (done) => {
    api.get('/god-mode')
    .set('x-api-key', '123myapikey')
    .auth('correct', 'credentials')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.have.property('teapots')
      done()
    })
  })

})
