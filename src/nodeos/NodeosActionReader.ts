import * as Logger from 'bunyan'
import { AbstractActionReader, NotInitializedError } from 'demux'
import request from 'request-promise-native'
import { RetrieveBlockError, RetrieveHeadBlockError, RetrieveIrreversibleBlockError } from '../errors'
import { NodeosActionReaderOptions } from '../interfaces'
import { retry } from '../utils'
import { NodeosBlock } from './NodeosBlock'

/**
 * Reads from an EOSIO nodeos node to get blocks of actions.
 * It is important to note that deferred transactions will not be included,
 * as these are currently not accessible without the use of plugins.
 */
export class NodeosActionReader extends AbstractActionReader {
  protected nodeosEndpoint: string
  protected log: Logger

  constructor(options: NodeosActionReaderOptions = {}) {
    super(options)
    const nodeosEndpoint = options.nodeosEndpoint ? options.nodeosEndpoint : 'http://localhost:8888'
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, '') // Removes trailing slashes
    this.log = Logger.createLogger({ name: 'demux' })
  }

  /**
   * Returns a promise for the head block number.
   */
  public async getHeadBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    try {
      const blockNum = await retry(async () => {
        const blockInfo = await request.get({
          url: `${this.nodeosEndpoint}/v1/chain/get_info`,
          json: true,
        })
        return blockInfo.head_block_num
      }, numRetries, waitTimeMs)
      return blockNum
    } catch (err) {
      throw new RetrieveHeadBlockError()
    }
  }

  public async getLastIrreversibleBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    try {
      const irreversibleBlockNum = await retry(async () => {
        const blockInfo = await request.get({
          url: `${this.nodeosEndpoint}/v1/chain/get_info`,
          json: true,
        })
        return blockInfo.last_irreversible_block_num
      }, numRetries, waitTimeMs)

      return irreversibleBlockNum
    } catch (err) {
      throw new RetrieveIrreversibleBlockError()
    }
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number, numRetries: number = 120, waitTimeMs: number = 250): Promise<NodeosBlock> {
    try {
      const block = await retry(async () => {
        const rawBlock = await request.post({
          url: `${this.nodeosEndpoint}/v1/chain/get_block`,
          json: { block_num_or_id: blockNumber },
        })
        return new NodeosBlock(rawBlock)
      }, numRetries, waitTimeMs)

      return block
    } catch (err) {
      throw new RetrieveBlockError()
    }
  }

  protected async setup(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      await request.get({
        url: `${this.nodeosEndpoint}/v1/chain/get_info`,
        json: true,
      })
    } catch (err) {
      throw new NotInitializedError('Cannot reach supplied nodeos endpoint.', err)
    }
  }
}
