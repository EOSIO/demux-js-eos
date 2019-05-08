import { Block, BlockInfo } from 'demux'
import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'
import { EosAction, TransactionActions } from '../../interfaces'
import { StateHistoryPostgresAbiProvider } from './StateHistoryPostgresAbiProvider'

// Wrapper to deal with differences between the definitions of fetch for the browser built-in
// and the node-fetch polyfill for node
// Is there a better way to do this?
const fetchWrapper = (input?: string | Request, init?: RequestInit): Promise<Response> => {
  const anyInput = input as any
  const anyInit = init as any
  return fetch(anyInput, anyInit) as any
}

export class StateHistoryPostgresBlock implements Block {
  public actions: EosAction[] = []
  public blockInfo: BlockInfo

  private api: any

  constructor(
    blockInfo: any,
    private actionTraceAuthorizations: any,
    private massiveInstance: any,
    private dbSchema: string = 'chain',
  ) {
    const signatureProvider = new JsSignatureProvider([])

    const rpc = new JsonRpc('', { fetch: fetchWrapper } )
    const abiProvider = new StateHistoryPostgresAbiProvider(this.massiveInstance, this.dbSchema)

    this.api = new Api({
      rpc,
      abiProvider,
      signatureProvider,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder()
    })

    this.blockInfo = {
      blockNumber: Number(blockInfo.block_index),
      blockHash: blockInfo.block_id,
      previousBlockHash: blockInfo.previous,
      timestamp: blockInfo.timestamp,
    }
  }

  public async parseActions() {
    const actionPromises: Array<Promise<EosAction>> = this.actionTraceAuthorizations.map(async (actionTrace: any) => {
      const serializedAction = {
        account: actionTrace.account,
        name: actionTrace.name,
        authorization: [{
          actor: actionTrace.actor,
          permission: actionTrace.permission,
        }],
        data: actionTrace.data,
      }
      const [deserializedAction] = await this.api.deserializeActions([serializedAction])
      const action: EosAction = {
        type: `${actionTrace.account}::${actionTrace.name}`,
        payload: {
          account: deserializedAction.account,
          name: deserializedAction.name,
          authorization: deserializedAction.authorization,
          data: deserializedAction.data,
          actionOrdinal: actionTrace.action_ordinal,
          transactionId: actionTrace.transaction_id,
          notifiedAccounts: [actionTrace.receipt_receiver],
          producer: actionTrace.producer,
          isContextFree: actionTrace.context_free,
          isInline: actionTrace.creatoraction_ordinal > 0,
          contextFreeData: actionTrace.partial_context_free_data,
        }
      }
      return action
    })

    this.actions = await Promise.all(actionPromises)
    this.linkTransactions()
  }

  private linkTransactions(): any {
    const actionsByTxId: { [key: string]: EosAction[] } = {}
    for (const action of this.actions) {
      if (!actionsByTxId[action.payload.transactionId]) {
        actionsByTxId[action.payload.transactionId] = []
      }
      actionsByTxId[action.payload.transactionId].push(action)
    }
    this.attachTransactionActions(actionsByTxId)
  }

  private attachTransactionActions(actionsByTxId: { [key: string]: EosAction[] }) {
    for (const transactionId of Object.keys(actionsByTxId)) {
      actionsByTxId[transactionId].sort((a: EosAction, b: EosAction) => {
        // No non-null assertion disabled because database will always have an action_ordinal value
        return a.payload.actionOrdinal! - b.payload.actionOrdinal! // tslint:disable-line
      })
      const transactionActions: TransactionActions = {
        contextFreeActions: [],
        actions: [],
        inlineActions: [],
      }
      const contextFreeData = actionsByTxId[transactionId][0].payload.contextFreeData
      for (const action of actionsByTxId[transactionId]) {
        action.payload.transactionActions = transactionActions
        action.payload.contextFreeData = contextFreeData
        if (action.payload.isInline) {
          transactionActions.inlineActions.push(action)
        } else if (action.payload.isContextFree) {
          transactionActions.contextFreeActions.push(action)
        } else {
          transactionActions.actions.push(action)
        }
      }
    }
  }
}
