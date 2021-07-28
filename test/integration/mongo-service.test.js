
const assert = require('assert').strict

const { mongoService } = require('../../index')

const MONGO_URL = process.env.MONGO_URL

describe('Integration tests of MongoService', function () {
    it('should return mongo repository', async function () {
        const repository = await mongoService.getMongoRepository(MONGO_URL, 'test-database', 'test-project')
        assert(repository)
    })
})
