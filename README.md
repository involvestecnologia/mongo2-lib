# @involves/mongodb2-lib

[![Build status](https://badge.buildkite.com/46ae64a78b965614e9e43df84286836470104984ed1c4448f3.svg)](https://buildkite.com/involves/nodejs-lib-mongodb2)

## Install
```
npm install @involves/mongodb2-lib --save
```

## Example usage

```javascript
    const express = require('express')
    const { MongoMiddleware } = require('@involves/mongodb2-lib')

    const app = express()
    app.use(MongoMiddleware.setMongoIntegration)
    app.get('/:id', (req, res) => {
        const record = await req.integrations.mongo.findById('collection', req.query.id)
        res.send(record)
    })
```

## How to run the tests

At the terminal, just type the command:
```
make test
```