# demux-js-eos [![Build Status](https://travis-ci.org/EOSIO/demux-js-eos.svg?branch=develop)](https://travis-ci.org/EOSIO/demux-js-eos)

Demux Action Reader implementations to read block and action data from EOSIO-based blockchains. 

## Installation


```bash
# Using yarn
yarn add demux-eos

# Using npm
npm install demux-eos --save
```

## Usage

This library provides three Action Reader implementations for reading from EOSIO blockchains: `NodeosActionReader`, `MongoActionReader`, and `StateHistoryPostgresActionReader`. **It is currently recommended to use the `StateHistoryPostgresActionReader`.**  

### Importing by Version

This library supports multiple versions of EOSIO. The currently supported versions as `v1.7` and `v1.8`. To import compatible classes for a specific version, imports must follow the following format:

```typescript
import { <class here> } from 'demux-eos/<version here>'
```

For example,

```typescript
import { StateHistoryPostgresActionReader } from 'demux-eos/v1.8'
```

## Readers

### MongoActionReader

Reads from a node's attached MongoDB instance when configured to use the MonogoDB Plugin.

#### Setup

To use the `MongoActionReader`, you must first make sure that your environment is properly configured, as it otherwise may yield unpredictable or incorrect results. To set up a proper environment, make sure the following are true:

- The node that has the MongoDB plugin activated:
  - Is not producing blocks
  - Is connected to the node(s) producing blocks via the `p2p-peer-address` configuration 
  - Has the `read-mode` configuration set to `read-only`
  - Has the `mongodb-update-via-block-num` configuration enabled

This means that in a development environment, you will need to set up at least two Nodeos instances: one to produce blocks, and a peer with the MongoDB plugin activated to populate the attached MongoDB.

For performance, the following settings are also recommended:

- Since the only collections utilized are the `block_states` and `action_traces`, we can save space by not indexing any of the other collections via setting the following options to `false`:
  - `mongodb-store-blocks`
  - `mongodb-store-transactions`
  - `mongodb-store-transaction-traces`
- Use the `mongodb-filter-out` option to isolate which accounts/actions you are indexing to only the actions you are listening for in your Action Handler. This will further reduce space requirements, and may give a performance boost via faster queries and less data for the Action Handler to process. For more information on how to filter, [see the MongoDB Plugin documentation](https://developers.eos.io/eosio-nodeos/docs/mongo_db_plugin#section-options).

#### Inline and Deferred Actions

Unlike the `NodeosActionReader`, inline and deferred actions are able to be captured and passed on to the Action Handler. Additionally, each Action has a `notifiedAccounts` property that lists all accounts notified of the blockchain action (this information is also not available via the `NodeosActionReader`).

#### Example

```javascript
const { BaseActionWatcher } = require("demux")
const { MongoActionReader } = require("demux-eos/v1.8")

// See supported Action Handlers here: https://github.com/EOSIO/demux-js#class-implementations
const actionHandler = ...

const actionReader = new MongoActionReader({
  startAtBlock: 1234,              // startAtBlock: the first block relevant to our application
  onlyIrreversible: false,         // onlyIrreversible: whether or not to only process irreversible blocks
  dbName: "EOS",                   // name of the database
  mongoEndpoint: "mongo://...",    // mongoEndpoint: the url of the mongodb instance
})

const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, { pollInterval: 500 })

// This must be done before calling watch so the MongoDB connection can be made
actionReader.initialize().then(() =>
  actionWatcher.watch()
)
```

### StateHistoryPostgresActionReader

Reads from a Postgres instance when nodeos is configured to use the State History Plugin as well as the [history-tools](https://github.com/EOSIO/history-tools).

#### Setup

To use the `StateHistoryPostgresActionReader`, you must first make sure that your environment is properly configured, as it otherwise may yield unpredictable or incorrect results. To set up a proper environment, make sure the following are true:

- You are running a producing node.

- You are running a second node with the state history plugin enabled.
  - Is not producing blocks
  - Is connected to the node(s) producing blocks via the `p2p-peer-address` configuration 
  - `--disable-replay-opts` set via CLI.
  - `--plugin eosio::state_history_plugin` set via CLI.
  - `--trace-history` set via CLI.
  - `--chain-state-history` set via CLI.
  - `--state-history-endpoint \"0.0.0.0:<preferred_port>\"` set via CLI.

- You are running history-tools.
  - `--fill-connect-to=<ip_of_above_node:port_specified>` set via CLI.
  - `--pg-schema=<preferred_schema>` set via CLI.
  - `--fpg-drop` set via CLI. This will cleanup any existing tables.
  - `--fpg-create` set via CLI. This will create the schema/tables as needed.

This means that in a development environment, you will need to set up at least two Nodeos instances: one to produce blocks, and a peer with the State History plugin activated to populate the Postgresql instance.

#### Inline and Deferred Actions

Unlike the `NodeosActionReader`, inline and deferred actions are able to be captured and passed on to the Action Handler. Additionally, each Action has a `notifiedAccounts` property that lists all accounts notified of the blockchain action (this information is also not available via the `NodeosActionReader`).

#### Example

```javascript
const { BaseActionWatcher } = require("demux")
const { StateHistoryPostgresActionReader } = require("demux-eos/v1.8")

// See supported Action Handlers here: https://github.com/EOSIO/demux-js#class-implementations
const actionHandler = ...

const massiveConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
}

const actionReader = new StateHistoryPostgresActionReader({
  startAtBlock: 1234,              // startAtBlock: the first block relevant to our application
  onlyIrreversible: false,         // onlyIrreversible: whether or not to only process irreversible blocks
  dbSchema: "chain",               // name of the database schema
  massiveConfig,                   // provides config to internal massivejs instance.
})

const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, { pollInterval: 500 })

// This must be done before calling watch so the PostgreSQL connection can be made
actionReader.initialize().then(() =>
  actionWatcher.watch()
)
```


### NodeosActionReader

Makes requests directly to a specified Nodeos API endpoint to obtain block data.

#### Setup

All that is required is a running Nodeos instance that has the `chain_api_plugin` enabled.

#### Example

```javascript
const { BaseActionWatcher } = require("demux")
const { NodeosActionReader } = require("demux-eos/v1.8")

// See supported Action Handlers here: https://github.com/EOSIO/demux-js#class-implementations
const actionHandler = ...

const actionReader = new NodeosActionReader({
  startAtBlock: 1234,             // startAtBlock: the first block relevant to our application
  onlyIrreversible: false,        // onlyIrreversible: whether or not to only process irreversible blocks
  nodeosEndpoint: "http://...",   // nodeosEndpoint: the url of the Nodeos API
})

const actionWatcher = new BaseActionWatcher(actionReader, actionHandler, { pollInterval: 500 })

actionWatcher.watch()
```

## Contributing

[Contributing Guide](./CONTRIBUTING.md)

[Code of Conduct](./CONTRIBUTING.md#conduct)

## License

[MIT](./LICENSE)

## Important

See LICENSE for copyright and license terms.  Block.one makes its contribution on a voluntary basis as a member of the EOSIO community and is not responsible for ensuring the overall performance of the software or any related applications.  We make no representation, warranty, guarantee or undertaking in respect of the software or any related documentation, whether expressed or implied, including but not limited to the warranties or merchantability, fitness for a particular purpose and noninfringement. In no event shall we be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or documentation or the use or other dealings in the software or documentation.  Any test results or performance figures are indicative and will not reflect performance under all conditions.  Any reference to any third party or third-party product, service or other resource is not an endorsement or recommendation by Block.one.  We are not responsible, and disclaim any and all responsibility and liability, for your use of or reliance on any of these resources. Third-party resources may be updated, changed or terminated at any time, so the information here may be out of date or inaccurate.
