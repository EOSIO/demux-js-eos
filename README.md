# demux-js-eos [![Build Status](https://travis-ci.org/EOSIO/demux-js-eos.svg?branch=develop)](https://travis-ci.org/EOSIO/demux-js-eos)


## Installation


```bash
# Using yarn
yarn add demux-eos

# Using npm
npm install demux-eos --save
```

## Usage

### MongoDB Plugin
```javascript
const { BaseActionWatcher } = require("demux")
const { MongoActionReader } = require("demux-eos")

const actionHandler = ... // see https://github.com/EOSIO/demux-js-postgres for a supported ActionHandler
const actionReader = new MongoActionReader(
    mongodbHost, // the url of the mongodb instance (mongodb://localhost:27017)
    2, // the mongodb plugin starts at block 2
    false, // whether or not to only process irreversible blocks
    600, // the maximum history length
    mongoDbName, // name of the database
)

const actionWatcher = new BaseActionWatcher(actionReader, actionHander, 500)

await actionReader.initialize() // This must be done before calling watch so the MongoDB connection can be made

actionWatcher.watch()
```

