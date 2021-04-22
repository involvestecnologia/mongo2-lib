const assert = require('assert').strict
const chai = require('chai')
const chaiHttp = require('chai-http')
const express = require('express')

const { MongoMiddleware } = require('../../index')

chai.use(chaiHttp)

describe('Integration tests of MongoMiddleware', function () {
  it('should inject mongoRepository at the request', async function () {
    const app = express()
    app.use(MongoMiddleware.setMongoRepository)
    const route = '/'
    app.get(route, (req, res) => {
      res.send('Hello World!')
      assert(req.mongoRepository)
    })

    const res = await chai.request(app).get(route)
    assert.equal(res.statusCode, 200)
  })
})
