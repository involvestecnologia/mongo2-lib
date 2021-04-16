const assert = require('assert').strict
const md5 = require('md5-file')
const { ObjectID } = require('mongodb')
const path = require('path')

const { MongoDatabase, MongoRepository } = require('../../index')

const MONGO_URL = process.env.MONGO_URL
const collection = 'test-collection'

describe('Integration tests of MongoRepository', () => {
    let connection, repository

    before(async () => {
        connection = await MongoDatabase.getConnection(MONGO_URL, 'test', 'test-application')
        repository = new MongoRepository(connection)
    })

    afterEach(async function () {
        await repository.deleteMany(collection, {})
      })

    after(async function () {
        await connection.dropDatabase()
    })

    it('deleteMany should deletec documents of given collection', async function () {
        const insertedObj = await connection.collection(collection).insertOne({ obj: 'abc' })
        assert('obj' in insertedObj.ops[0])
    
        await repository.deleteMany(collection, {})
    
        const databaseResult = await connection.collection(collection).findOne({})
        assert.ifError(databaseResult)
      })
    
      it('insertOne should store object with createdAt property', async function () {
        const expectedValue = {
          _id: new ObjectID(),
          string: 'string',
          number: 0
        }
        await repository.insertOne(collection, expectedValue)
    
        const result = await connection.collection(collection).findOne({})
    
        assert.deepEqual(result._id, expectedValue._id)
        assert.deepEqual(result.string, expectedValue.string)
        assert.deepEqual(result.number, expectedValue.number)
        assert('createdAt' in result)
      })
    
      it('ping should check db\'s connection', async function () {
        const result = await repository.ping()
        assert.deepEqual(result, { ok: 1 })
      })
    
      it('storeFile should generate the same MD5 of original file', async function () {
        const id = new ObjectID()
        const csv = {
          name: 'file.csv'
        }
        csv.path = path.join(path.resolve(__dirname, '..'), 'assets', csv.name)

        const resp = await repository.storeFile(collection, id, csv.name, csv.path)
    
        const expectedMd5 = md5.sync(csv.path)
        assert.equal(resp.md5, expectedMd5)
      })
})