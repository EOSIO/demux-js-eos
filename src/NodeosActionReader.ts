import * as Logger from 'bunyan'
import { AbstractActionReader } from 'demux'
import request from 'request-promise-native'
import { NodeosBlock } from './NodeosBlock'

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Reads from an EOSIO nodeos node to get blocks of actions.
 * It is important to note that deferred transactions will not be included,
 * as these are currently not accessible without the use of plugins.
 */
export class NodeosActionReader extends AbstractActionReader {
  protected nodeosEndpoint: string
  protected log: Logger

  constructor(
    nodeosEndpoint: string = 'http://localhost:8888',
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
  ) {
    super(startAtBlock, onlyIrreversible, maxHistoryLength)
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, '') // Removes trailing slashes

    this.log = Logger.createLogger({ name: 'demux' })
  }

  /**
   * Returns a promise for the head block number.
   */
  public async getHeadBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    let numTries = 1
    while (numTries <= numRetries + 1) {
      try {
        const blockInfo = await request.get({
          url: `${this.nodeosEndpoint}/v1/chain/get_info`,
          json: true,
        })
        return blockInfo.head_block_num
      } catch (err) {
        if (numTries - 1 === numRetries) {
          throw err
        }
        this.log.error('error getting head block number, retrying...')
      }
      numTries += 1
      await wait(waitTimeMs)
    }

    throw Error('Unknown error getting head block number.')
  }

  public async getLastIrreversibleBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    let numTries = 1
    while (numTries <= numRetries + 1) {
      try {
        const blockInfo = await request.get({
          url: `${this.nodeosEndpoint}/v1/chain/get_info`,
          json: true,
        })
        return blockInfo.last_irreversible_block_num
      } catch (err) {
        if (numTries - 1 === numRetries) {
          throw err
        }
        this.log.error('error getting last irreversible block number, retrying...')
      }
      numTries += 1
      await wait(waitTimeMs)
    }

    throw Error('Unknown error getting last irreversible block number.')
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number, numRetries: number = 120, waitTimeMs: number = 250): Promise<NodeosBlock> {
    let numTries = 1
    while (numTries <= numRetries + 1) {
      try {
        const rawBlock = await request.post({
          url: `${this.nodeosEndpoint}/v1/chain/get_block`,
          json: { block_num_or_id: blockNumber },
        })
        const block = new NodeosBlock(rawBlock)
        return block
      } catch (err) {
        if (numTries - 1 === numRetries) {
          throw err
        }
        this.log.error('error retrieving block, retrying...')
      }
      numTries += 1
      await wait(waitTimeMs)
    }

    throw Error('Unknown error getting block.')
  }
}
