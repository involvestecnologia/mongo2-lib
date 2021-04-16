# @involves/mongodb-lib

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