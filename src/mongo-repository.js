const fs = require('fs')
const { GridFSBucket, ObjectID } = require('mongodb')

class MongoRepository {
  constructor (database) {
    this.database = database
  }

  async deleteById (collection, id, options) {
    const databaseResult = await this.database.collection(collection).deleteOne({ _id: ObjectID(id) }, options)
    return databaseResult.deletedCount > 0
  }

  async deleteMany (collection, filter, options) {
    const databaseResult = await this.database.collection(collection).deleteMany(filter, options)
    return Boolean(databaseResult.value)
  }

  findById (collection, id, options) {
    return this.database.collection(collection).findOne({ _id: ObjectID(id) }, options)
  }

  async findByIdAndUpdate (collection, id, fields, options = { returnOriginal: false }) {
    const datedField = _insertLastUpdate(fields)

    const databaseResult = await this.database.collection(collection).findOneAndUpdate({ _id: ObjectID(id) }, { $set: datedField }, options)
    return databaseResult.value
  }

  findOne (collection, filter, options) {
    return this.database.collection(collection).findOne(filter, options)
  }

  async findWithPagination (collection, filter, fields, skip, limit = 10, sort) {
    const aggregateQuery = [
      {
        $facet: {
          data: [],
          totalCount: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]

    if (filter) {
      aggregateQuery[0].$facet.data.push({
        $match: filter
      })
    }

    if (fields) {
      aggregateQuery[0].$facet.data.push({ $project: fields })
    }

    if (sort) {
      aggregateQuery[0].$facet.data.push({ $sort: sort })
    }

    if (skip) {
      aggregateQuery[0].$facet.data.push({ $skip: skip })
    }

    aggregateQuery[0].$facet.data.push({ $limit: limit })

    const resultDatabase = await this.database.collection(collection)
      .aggregate(aggregateQuery)
      .toArray()

    return {
      items: resultDatabase[0].data,
      total: resultDatabase[0].totalCount[0].count
    }
  }

  async insertOne (collection, value, options) {
    let datedValue = _insertCreatedAt(value)
    datedValue = _insertLastUpdate(value)

    const databaseResult = await this.database.collection(collection).insertOne(datedValue, options)
    return databaseResult.ops[0]
  }

  async insertMany (collection, valueList, options) {
    for (let value of valueList) {
      value = _insertCreatedAt(value)
      value = _insertLastUpdate(value)
    }

    const databaseResult = await this.database.collection(collection).insertMany(valueList, options)
    return databaseResult.ops
  }

  ping () {
    return this.database.command({ ping: 1 })
  }

  storeFile (bucketName, id, fileName, filePath) {
    const bucket = new GridFSBucket(this.database, {
      bucketName
    })

    const stream = fs.createReadStream(filePath)
      .pipe(bucket.openUploadStreamWithId(id, fileName))

    return new Promise((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

  downloadFile (bucketName, id, filePath) {
    const bucket = new GridFSBucket(this.database, {
      bucketName
    })

    return new Promise((resolve, reject) => {
      bucket.openDownloadStream(id)
        .on('error', reject)
        .pipe(fs.createWriteStream(filePath))
        .on('finish', resolve)
        .on('error', reject)
    })
  }
}

const _insertCreatedAt = (value) => {
  value.createdAt = new Date().toISOString()
  return value
}

const _insertLastUpdate = (value) => {
  value._lastUpdate = new Date().toISOString()
  return value
}

module.exports = MongoRepository
