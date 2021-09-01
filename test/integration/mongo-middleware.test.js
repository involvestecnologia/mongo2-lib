const assert = require('assert').strict
const chai = require('chai')
const chaiHttp = require('chai-http')
const express = require('express')

const { MongoMiddleware } = require('../../index')

chai.use(chaiHttp)

describe('Integration tests of MongoMiddleware', function () {
  it('should inject integrations.mongo at the request', async function () {
    const app = express()
    app.use(MongoMiddleware.setMongoIntegration)
    const route = '/'
    app.get(route, (req, res) => {
      res.send('Hello World!')
      assert(req.integrations.mongo)
    })

    const res = await chai.request(app).get(route)
    assert.equal(res.statusCode, 200)
  })
})
