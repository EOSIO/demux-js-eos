import { Block, BlockInfo } from 'demux'
import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'
import { EosAction } from '../../interfaces'
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

  public async parseActions(): Promise<EosAction[]> {
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

      const producer = actionTrace.producer

      const [deserializedAction] = await this.deserializeActionTraces([serializedAction])

      const action: EosAction = {
        type: `${actionTrace.account}::${actionTrace.name}`,
        payload: {
          ...deserializedAction,
          actionIndex: actionTrace.action_index,
          transactionId: actionTrace.transaction_id,
          notifiedAccounts: [actionTrace.receipt_receiver],
          producer
        }
      }
      return action
    })

    this.actions = await Promise.all(actionPromises)
    return this.actions
  }

  private async deserializeActionTraces(actionTraces: any): Promise<any> {
    const actions = await this.api.deserializeActions(actionTraces)
    return actions
  }
}
