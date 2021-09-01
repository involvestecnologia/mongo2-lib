
const MongoConnection = require('./mongo-connection')
const MongoRepository = require('./mongo-repository')

class MongoMiddleware {
  static async setMongoIntegration (req, _res, next) {
    const connection = await MongoConnection.getConnection(
      process.env.MONGO_URL, process.env.MONGO_DB, process.env.APP_NAME)
    const mongoRepository = new MongoRepository(connection)
    if (!req.integrations) req.integrations = {}
    req.integrations.mongo = mongoRepository
    next()
  }
}

module.exports = MongoMiddleware
