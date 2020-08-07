import { NodeosBlock } from '../../../v1.7/readers/nodeos/NodeosBlock'
import { EosAction } from '../../../v1.7/interfaces'

export class TraceBlock extends NodeosBlock {
  protected collectActionsFromBlock(rawBlock: any): EosAction[] {
    const producer = rawBlock.producer
    return this.flattenArray(rawBlock.transactions.map((transaction: any, index: number) => {
        return transaction.trx.transaction.actions.map((action: any, actionIndex: number) => {
        if (typeof action.data === "string") {
          this.log.warn(
            `Action data for '${action.receiver}::${action.action}' not deserialized ` +
            `(block ${this.blockInfo.blockNumber}, transaction index ${index}, action index ${actionIndex})`
          )
        }
        const block = {
          type: `${action.receiver}::${action.action}`,
          payload: {
            producer,
            transactionId: transaction.id,
            actionIndex,
            ...action,
          },
        }
        return block
      })
    }))
  }
}
