import { NodeosBlock } from '../../../v1.7/readers/nodeos/NodeosBlock'
import { EosAction } from '../../../v1.7/interfaces'

export class TraceBlock extends NodeosBlock {
  protected collectActionsFromBlock(rawBlock: any): EosAction[] {
    // workaround fix
    this.blockInfo.blockNumber = rawBlock.number
    this.blockInfo.previousBlockHash = rawBlock.previous_id
    //
    const producer = rawBlock.producer
    return this.flattenArray(rawBlock.transactions.map((transaction: any, _: number) => {
      return transaction.actions.map((action: any, actionIndex: number) => {
        if (typeof action.data === 'string') {
          // TODO: action data deserialization when abi is provided
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
