const assert = require('assert').strict

const { MongoDatabase } = require('../../index')

const MONGO_URL = process.env.MONGO_URL

describe('Integration tests of MongoDatabase', () => {
    it('should connect with mongodb', async () => {
        const connection = await MongoDatabase.getConnection(MONGO_URL, 'test', 'test-application')
        assert(connection)
    })
})