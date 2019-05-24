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

const signatureProvider = new JsSignatureProvider([])
const rpc = new JsonRpc('', { fetch: fetchWrapper } )
const abiProvider = new StateHistoryPostgresAbiProvider()
const api = new Api({
  rpc,
  abiProvider,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder()
})

const getApi = (massiveInstance: any, dbSchema: string, blockNumber: number) => {
  const instanceAbiProvider = api.abiProvider as StateHistoryPostgresAbiProvider
  instanceAbiProvider.massiveInstance = massiveInstance
  instanceAbiProvider.dbSchema = dbSchema
  instanceAbiProvider.blockNumber = blockNumber
  return api
}

export class StateHistoryPostgresBlock implements Block {
  public actions: EosAction[] = []
  public blockInfo: BlockInfo
  private contextFreeDataById: any = {}

  constructor(
    rawBlockInfo: any,
    private actionTraceAuthorizations: any,
    private rawContextFreeData: any,
    private massiveInstance: any,
    private dbSchema: string = 'chain',
  ) {
    this.blockInfo = {
      blockNumber: Number(rawBlockInfo.block_num),
      blockHash: rawBlockInfo.block_id,
      previousBlockHash: rawBlockInfo.previous,
      timestamp: rawBlockInfo.timestamp,
    }
    this.getContextFreeDataById()
    this.warnIfNotDistinct()
  }

  private defaultIgnoreActions = ['eosio::onblock']

  public async parseActions() {
    const eosApi = getApi(this.massiveInstance, this.dbSchema, this.blockInfo.blockNumber)
    const filteredActionTraces = this.actionTraceAuthorizations.filter((actionTrace: any) => {
      if (this.defaultIgnoreActions.includes(`${actionTrace.act_account}::${actionTrace.act_name}`)) {
        return false
      }
      return true
    })

    // Make sure to fetch ABI for the same contract only once
    const indexedFirstActions = await this.getIndexedFirstActions(eosApi, filteredActionTraces)

    const actionPromises: Array<Promise<EosAction>> = filteredActionTraces.map(
      async (actionTrace: any, index: number) => {
        if (indexedFirstActions[index]) {
          return indexedFirstActions[index]
        }
        return this.getEosAction(eosApi, actionTrace)
      }
    )

    this.actions = (await Promise.all(actionPromises)).filter(
      (action): action is EosAction => (action !== null)
    )
    this.linkTransactions()
  }

  private warnIfNotDistinct() {
    const globalSequences = [
      ...new Set(this.actionTraceAuthorizations.map((action: any) => action.receipt_global_sequence))
    ]
    if (!(globalSequences.length === this.actionTraceAuthorizations.length)) {
      console.warn(`Global action traces are not distinct. Block number: ${this.blockInfo.blockNumber}`)
    }
  }

  private async getIndexedFirstActions(eosApi: Api, actionTraces: any) {
    const toProcessFirst: { [key: string]: any } = actionTraces.reduce(
      (accumulator: any, actionTrace: any, index: number) => {
        if (!Object.keys(accumulator).includes(actionTrace.act_account)) {
          accumulator[actionTrace.act_account] = {
            actionTrace,
            index,
          }
        }
        return accumulator
      },
      {}
    )
    const firstActionsPromises = Object.values(toProcessFirst).map(async (indexedActionTrace: any) => {
      const action = await this.getEosAction(eosApi, indexedActionTrace.actionTrace)
      return {
        action,
        index: indexedActionTrace.index,
      }
    })
    const firstActions = await Promise.all(firstActionsPromises)
    return firstActions.reduce(
      (accumulator: any, firstAction: any) => {
        accumulator[firstAction.index] = firstAction.action
        return accumulator
      },
      {}
    )
  }

  private createSerializedAction(actionTrace: any) {
    return {
      account: actionTrace.act_account,
      name: actionTrace.act_name,
      authorization: actionTrace.authorizations.map((authorization: string[]) => {
        return {
          actor: authorization[0],
          permission: authorization[1],
        }
      }),
      data: actionTrace.act_data,
    }
  }

  private async getEosAction(eosApi: Api, actionTrace: any): Promise<any> {
    const serializedAction = this.createSerializedAction(actionTrace)
    let deserializedAction: any
    try {
      [deserializedAction] = await eosApi.deserializeActions([serializedAction])
    } catch (err) {
      if (err.message.startsWith('Unknown action')) {
        eosApi.cachedAbis.delete(actionTrace.act_account)
        eosApi.contracts.delete(actionTrace.act_account)
        try {
          [deserializedAction] = await eosApi.deserializeActions([serializedAction])
        } catch (err) {
          if (err.message.startsWith('Unknown action')) {
            console.warn(`Action ${actionTrace.act_account}::${actionTrace.act_name} does not have an ABI; ` +
              `Using serialized action instead.`)
            deserializedAction = serializedAction
          } else {
            throw err
          }
        }
      } else {
        throw err
      }
    }

    const action: EosAction = {
      type: `${actionTrace.act_account}::${actionTrace.act_name}`,
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
        isInline: actionTrace.creator_action_ordinal > 0,
        contextFreeData: this.contextFreeDataById[actionTrace.transaction_id] || []
      }
    }

    return action
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

  private getContextFreeDataById() {
    this.contextFreeDataById = this.rawContextFreeData.reduce((accumulator: any, cfd: any) => {
      accumulator[cfd.id] = cfd.partial_context_free_data
      return accumulator
    }, {})
  }
}
