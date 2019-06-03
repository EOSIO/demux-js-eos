import { Block, BlockInfo } from 'demux'
import { EosAction } from '../../interfaces'

export class NodeosBlock implements Block {
  public actions: EosAction[]
  public blockInfo: BlockInfo
  constructor(rawBlock: any) {
    this.actions = this.collectActionsFromBlock(rawBlock)
    this.blockInfo = {
      blockNumber: rawBlock.block_num,
      blockHash: rawBlock.id,
      previousBlockHash: rawBlock.previous,
      timestamp: new Date(rawBlock.timestamp),
    }
  }

  protected collectActionsFromBlock(rawBlock: any): EosAction[] {
    const producer = rawBlock.producer
    return this.flattenArray(rawBlock.transactions.map((transaction: any) => {
      if (!transaction.trx.transaction) {
        return [] // Deferred transaction, cannot decode
      }
      return transaction.trx.transaction.actions.map((action: any, actionIndex: number) => {
        // Delete unneeded hex data if we have deserialized data
        if (action.data) {
          delete action.hex_data // eslint-disable-line
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

  private flattenArray(arr: any[]): any[] {
    return arr.reduce((flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? this.flattenArray(toFlatten) : toFlatten), [])
  }
}
