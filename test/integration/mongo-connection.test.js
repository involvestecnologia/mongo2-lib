const assert = require('assert').strict

const { MongoConnection } = require('../../index')

const { MONGO_URL } = process.env

describe('Integration tests of MongoConnection', function () {
  it('should connect with mongodb', async function () {
    const connection = await MongoConnection.getConnection(MONGO_URL, 'test', 'test-application')
    assert(connection)
  })
})
