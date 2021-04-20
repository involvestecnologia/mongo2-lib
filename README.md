# @involves/mongodb-lib

[![Build status](https://badge.buildkite.com/58019b126a23ee15d39c35c6a38d98dd1b81413af146e01d4e.svg)](https://buildkite.com/involves/nodejs-lib-mongodb)

## Install
```
npm install @involves/mongodb-lib --save
```

## Example usage

```javascript
    const express = require('express')
    const { MongoMiddleware } = require('@involves/mongodb-lib')

    const app = express()
    app.use(MongoMiddleware.setMongoRepository)
    app.get('/:id', (req, res) => {
        const record = await req.mongoRepository.findById('collection', req.query.id)
        res.send(record)
    })
```

## How to run the tests

At the terminal, just type the command:
```
make test
```