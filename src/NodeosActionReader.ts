import { AbstractActionReader } from "demux"
import request from "request-promise-native"
import { NodeosBlock } from "./NodeosBlock"

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
  constructor(
    nodeosEndpoint: string = "http://localhost:8888",
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
    protected requestInstance: any = request,
    protected numberOfConfirmations = 0,
  ) {
    super(startAtBlock, onlyIrreversible, maxHistoryLength)
    // Remove trailing slashes
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, "")
    this.numberOfConfirmations = numberOfConfirmations
  }

  /**
   * Returns a promise for the head block number.
   */
  public async getHeadBlockNumber(numRetries: number = 120, waitTimeMs: number = 250): Promise<number> {
    let numTries = 1
    while (numTries < numRetries) {
      try {
        const blockInfo = await this.httpRequest("get", {
          url: `${this.nodeosEndpoint}/v1/chain/get_info`,
          json: true,
        })
        if (this.onlyIrreversible) {
          return blockInfo.last_irreversible_block_num
        }
        return blockInfo.head_block_num - this.numberOfConfirmations
      } catch (err) {
        console.info("error getting head block number, retrying...")
      }
      numTries += 1
      await wait(waitTimeMs)
    }

    throw Error("Retrieving head block number failed!")
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number, numRetries: number = 120, waitTimeMs: number = 250): Promise<NodeosBlock> {
    let numTries = 1
    while (numTries < numRetries) {
      try {
        const rawBlock = await this.httpRequest("post", {
          url: `${this.nodeosEndpoint}/v1/chain/get_block`,
          json: { block_num_or_id: blockNumber },
        })
        const block = new NodeosBlock(rawBlock)
        return block
      } catch (err) {
        console.info("error retrieving block, retrying...")
      }
      numTries += 1
      await wait(waitTimeMs)
    }

    throw Error("Retrieving block failed!")
  }

  protected async httpRequest(method: string, requestParams: any): Promise<any> {
    if (method === "get") {
      return await this.requestInstance.get(requestParams)
    } else if (method === "post") {
      return await this.requestInstance.post(requestParams)
    }
  }
}
