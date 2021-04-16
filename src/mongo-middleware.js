'use strict'

const MongoDatabase = require('./mongo-database')
const MongoRepository = require('./mongo-repository')

class MongoMiddleware {
  static async setMongoRepository (req, res, next) {
    const database = await MongoDatabase.getConnection(
      process.env.MONGO_URL, process.env.MONGO_DB, process.env.APP_NAME)
    const mongoRepository = new MongoRepository(database)
    req.mongoRepository = mongoRepository
    next()
  }
}

module.exports = MongoMiddleware
