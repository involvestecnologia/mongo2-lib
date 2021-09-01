
const assert = require('assert').strict

const { MongoService } = require('../../index')

const { MONGO_URL } = process.env

describe('Integration tests of MongoService', function () {
  it('should return mongo repository', async function () {
    const repository = await MongoService.getMongoRepository(MONGO_URL, 'test-database', 'test-project')
    assert(repository.database)
    assert(repository.findById)
  })
})
