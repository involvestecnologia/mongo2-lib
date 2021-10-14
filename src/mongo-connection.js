
const { MongoClient } = require('mongodb')

class MongoConnection {
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

const _connect = (dbConnection, url, appName) => {
  if (dbConnection && dbConnection.isConnected()) return dbConnection

  let urlString = url
  if (urlString.indexOf('mongodb') === -1) {
    urlString = `mongodb://${url}`
  }

  return MongoClient.connect(
    urlString,
    {
      appname: appName,
      native_parser: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
}

module.exports = MongoConnection
