
const MongoConnection = require('./mongo-connection')
const MongoRepository = require('./mongo-repository')

class MongoService {
  static async getMongoRepository (mongoUrl, databaseName, projectName) {
    const connection = await MongoConnection.getConnection(mongoUrl, databaseName, projectName)
    return new MongoRepository(connection)
  }
}

module.exports = MongoService
