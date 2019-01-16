import * as Logger from 'bunyan'
import { AbstractActionReader } from 'demux'
import { Db, MongoClient } from 'mongodb'
import { MongoBlock } from './MongoBlock'
import { retry } from './utils'

/**
 * Implementation of an ActionReader that reads blocks from a mongodb instance.
 */
export class MongoActionReader extends AbstractActionReader {
  private mongodb: Db | null
  protected log: Logger
  constructor(
    protected mongoEndpoint: string = 'mongodb://127.0.0.1:27017',
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
    public dbName: string = 'EOS',
  ) {
    super(startAtBlock, onlyIrreversible, maxHistoryLength)
    this.mongodb = null
    this.log = Logger.createLogger({ name: 'demux' })
  }

  public async initialize() {
    const mongoInstance = await MongoClient.connect(this.mongoEndpoint, { useNewUrlParser: true })
    this.mongodb = await mongoInstance.db(this.dbName)
  }

  public async getHeadBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    this.throwIfNotInitialized()

    try {
      const blockNum = await retry(async () => {
        const [blockInfo] = await this.mongodb!.collection('block_states')
          .find({})
          .limit(1)
          .sort({ $natural: -1 })
          .toArray()

        return blockInfo.block_header_state.block_num
      }, numRetries, waitTimeMs)

      return blockNum
    } catch (err) {
      throw new Error('Error retrieving head block, max retries failed')
    }
  }

  public async getLastIrreversibleBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    this.throwIfNotInitialized()

    try {
      const irreversibleBlockNum = await retry(async () => {
        const [blockInfo] = await this.mongodb!.collection('block_states')
          .find({})
          .limit(1)
          .sort({ $natural: -1 })
          .toArray()

        return blockInfo.block_header_state.dpos_irreversible_blocknum
      }, numRetries, waitTimeMs)

      return irreversibleBlockNum
    } catch (err) {
      throw new Error('Error retrieving last irreversible block, max retries failed')
    }
  }

  public async getBlock(blockNumber: number, numRetries: number = 120, waitTimeMs: number = 250): Promise<MongoBlock> {
    this.throwIfNotInitialized()

    try {
      const mongoBlock = await retry(async () => {
        const blockStates = await this.mongodb!.collection('block_states')
          .find({ block_num: blockNumber })
          .toArray()

        this.validateBlockStates(blockStates, blockNumber)
        const [blockState] = blockStates
        const rawActions = await this.mongodb!.collection('action_traces')
          .find({
            block_num: blockNumber,
            producer_block_id: blockState.block_id,
          })
          .sort({ 'receipt.global_sequence': 1 })
          .toArray()

        return new MongoBlock(blockState, rawActions)
      }, numRetries, waitTimeMs)

      return mongoBlock
    } catch (err) {
      throw new Error('Error retrieving block, max retries failed')
    }
  }

  private throwIfNotInitialized() {
    if (!this.mongodb) {
      throw Error('MongoActionReader must be initialized before fetching blocks.')
    }
  }

  private validateBlockStates(blockStates: any, blockNumber: number) {
    if (blockStates.length === 0) {
      throw new Error(`No block state with block number ${blockNumber} found`)
    } else if (blockStates.length > 1) {
      throw new Error(`More than one block state returned for block number ${blockNumber}. ` +
        'Make sure you have the `--mongodb-update-via-block-num` flag set on your node.')
    }
  }
}
