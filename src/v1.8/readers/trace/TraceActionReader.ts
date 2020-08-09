import { NodeosActionReader } from '../../../v1.7/readers/nodeos/NodeosActionReader'
import { retry } from '../../../v1.7/utils'
import request from 'request-promise-native'
import { RetrieveBlockError } from '../../../v1.7/errors'
import { TraceActionReaderOptions } from './interfaces'
import { TraceBlock } from './TraceBlock'

export class TraceActionReader extends NodeosActionReader {
  constructor(options: TraceActionReaderOptions) {
    super(options)
  }

  public async getBlock(blockNumber: number, numRetries: number = 120, waitTimeMs: number = 250): Promise<TraceBlock> {
    try {
      const block = await retry(async () => {
        const rawBlock = await request.post({
          url: `${this.nodeosEndpoint}/v1/trace_api/get_block`,
          json: { block_num: blockNumber },
        })
        return new TraceBlock(rawBlock, this.log)
      }, numRetries, waitTimeMs)

      return block
    } catch (err) {
      this.log.error(err)
      throw new RetrieveBlockError()
    }
  }
}
