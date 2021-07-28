'use strict'

const mongoDatabase = require('./mongo-database');
const MongoRepository = require('./mongo-repository');

class MongoService {
    static async getMongoRepository(mongoUrl, databaseName, projectName) {
        const database = await mongoDatabase.getConnection(mongoUrl, databaseName, projectName)

        return new MongoRepository(database)
    }
}

module.exports = MongoService
