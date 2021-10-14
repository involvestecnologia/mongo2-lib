
const assert = require('assert').strict

const { MongoService } = require('../../index')

const { MONGO_DB, MONGO_URL } = process.env

describe('Integration tests of MongoService', function () {
  it('should return mongo repository', async function () {
    const repository = await MongoService.getMongoRepository(MONGO_URL, MONGO_DB, 'test-project')
    assert(repository.database)
    assert(repository.findById)
  })
})
