const assert = require('assert').strict
const md5 = require('md5-file')
const { ObjectID } = require('mongodb')
const path = require('path')
const fs = require('fs')

const { MongoConnection, MongoRepository } = require('../../index')

const { MONGO_URL } = process.env
const collection = 'test-collection'

describe('Integration tests of MongoRepository', function () {
  let connection = {}
  let repository = {}

  before(async function () {
    connection = await MongoConnection.getConnection(MONGO_URL, 'test', 'test-application')
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
      number: 0,
      string: 'string'
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

  it('verify download file', async function () {
    const id = new ObjectID()
    const csv = {
      name: 'file.csv'
    }
    csv.path = path.join(path.resolve(__dirname, '..'), 'assets', csv.name)

    await repository.storeFile(collection, id, csv.name, csv.path)

    const pathFinal = path.join(path.resolve(__dirname, '..'), 'assets', 'tmp.csv')

    await repository.downloadFile(collection, id, pathFinal)

    assert.deepEqual(fs.existsSync(pathFinal), true)
  })

  it('download file should return file not found', async function () {
    const id = new ObjectID()
    const pathFinal = path.join(path.resolve(__dirname, '..'), 'assets', 'tmp.csv')

    await assert.rejects(
      async () => { await repository.downloadFile(collection, id, pathFinal) },
      { message: `FileNotFound: file ${id} was not found`, name: 'Error' }
    )
  })

  it('download file should return no such file or directory', async function () {
    const id = new ObjectID()
    const pathFinal = path.join(path.resolve(__dirname, '..'), 'assets', 'tmp', 'tmp.csv')

    await assert.rejects(
      async () => { await repository.downloadFile(collection, id, pathFinal) },
      { message: `ENOENT: no such file or directory, open '${pathFinal}'`, name: 'Error' }
    )
  })
})
