'use strict'

const { MongoClient } = require('mongodb')

class MongoDatabase {
  /**
   * Represents a connection with a MongoDb
   * @param {string} url - IP or name to establish connection. Example {mongo-pod-name}:27017
   * @param {string} dbName - database name of the connection
   * @param {string} appName - the application name
   */
  static async getConnection (url, dbName, appName = '') {
    this.dbConnection = await _connect(this.dbConnection, url, appName)
    return this.dbConnection.db(dbName)
  }
}

const _connect = async (dbConnection, url, appName) => {
  if (dbConnection && dbConnection.isConnected()) return dbConnection

  const connection = `mongodb://${url}`

  dbConnection = await MongoClient.connect(
    connection,
    {
      native_parser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      appname: appName
    }
  )

  return dbConnection
}

module.exports = MongoDatabase
