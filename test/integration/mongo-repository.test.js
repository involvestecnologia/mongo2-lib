const assert = require('assert').strict
const md5 = require('md5-file')
const { ObjectID } = require('mongodb')
const path = require('path')
const fs = require('fs')

const { MongoConnection, MongoRepository } = require('../../index')

const { MONGO_DB, MONGO_URL } = process.env
const collection = 'test-collection'

describe('Integration tests of MongoRepository', function () {
  let connection = {}
  let repository = {}

  before(async function () {
    connection = await MongoConnection.getConnection(MONGO_URL, MONGO_DB, 'test-application')
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

  it('find by pagination', async function () {
    const valueList = _createRegisters(170)

    await connection.collection(collection).insertMany(valueList)

    let resultPages = []

    const firstPage = await repository.findWithPagination(collection, {}, { limit: 50, offset: 0 })
    resultPages = resultPages.concat(firstPage.items)
    const secondPage = await repository.findWithPagination(collection, {}, { limit: 50, offset: 1 })
    resultPages = resultPages.concat(secondPage.items)
    const thirdPage = await repository.findWithPagination(collection, {}, { limit: 50, offset: 2 })
    resultPages = resultPages.concat(thirdPage.items)
    const lastPage = await repository.findWithPagination(collection, {}, { limit: 50, offset: 3 })
    resultPages = resultPages.concat(lastPage.items)

    assert.equal(firstPage.items.length, 50)
    assert.equal(secondPage.items.length, 50)
    assert.equal(thirdPage.items.length, 50)
    assert.equal(lastPage.items.length, 20)

    let index = 0
    for (index = 0; index < resultPages.length; index += 1) {
      assert.equal(resultPages[parseInt(index, 10)].number, index)
    }
  })

  it('find by pagination with filter', async function () {
    const valueList = _createRegisters(170)

    await connection.collection(collection).insertMany(valueList)

    const results = await repository.findWithPagination(collection, { number: 55 }, { limit: 50, offset: 0 })

    assert.equal(results.total, 1)
    assert.equal(results.items[0].number, 55)
  })

  it('find by pagination with no result', async function () {
    const valueList = _createRegisters(170)

    await connection.collection(collection).insertMany(valueList)

    const results = await repository.findWithPagination(collection, { number: 999 }, { limit: 50, offset: 0 })

    assert.equal(results.total, 0)
    assert.deepEqual(results.items, [])
  })
})

const _createRegisters = (totalCount) => {
  const valueList = []

  let registerId = 0
  for (registerId = 0; registerId < totalCount; registerId += 1) {
    valueList.push({
      _id: new ObjectID(),
      number: registerId
    })
  }

  return valueList
}
