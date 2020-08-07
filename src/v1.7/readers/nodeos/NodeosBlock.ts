import * as Logger from 'bunyan'
import { Block, BlockInfo } from 'demux'
import { EosAction } from '../../interfaces'

export class NodeosBlock implements Block {
  public actions: EosAction[]
  public blockInfo: BlockInfo
  constructor(
    rawBlock: any,
    protected log: Logger
  ) {
    this.blockInfo = {
      blockNumber: rawBlock.block_num,
      blockHash: rawBlock.id,
      previousBlockHash: rawBlock.previous,
      timestamp: new Date(rawBlock.timestamp),
    }
    this.actions = this.collectActionsFromBlock(rawBlock)
  }

  protected collectActionsFromBlock(rawBlock: any): EosAction[] {
    const producer = rawBlock.producer
    return this.flattenArray(rawBlock.transactions.map((transaction: any, index: number) => {
      if (!transaction.trx.transaction) {
        this.log.warn(
          `Transaction is of deferred type; cannot decode ` +
          `(block ${this.blockInfo.blockNumber}, transaction index ${index})`
        )
        return []
      }
      return transaction.trx.transaction.actions.map((action: any, actionIndex: number) => {
        if (action.data) {
          delete action.hex_data // eslint-disable-line
        } else {
          this.log.warn(
            `Action data for '${action.account}::${action.name}' not deserialized ` +
            `(block ${this.blockInfo.blockNumber}, transaction index ${index}, action index ${actionIndex})`
          )
        }
        const block = {
          type: `${action.account}::${action.name}`,
          payload: {
            producer,
            transactionId: transaction.trx.id,
            actionIndex,
            ...action,
          },
        }
        return block
      })
    }))
  }

  protected flattenArray(arr: any[]): any[] {
    return arr.reduce((flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? this.flattenArray(toFlatten) : toFlatten), [])
  }
}
