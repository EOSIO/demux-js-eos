import { AbstractActionReader, Action, ActionReaderOptions, Block, NotInitializedError } from 'demux'
import { Api, JsonRpc } from 'eosjs'
import JsSignatureProvider from 'eosjs/dist/eosjs-jssig'
import massive from 'massive'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'

// Wrapper to deal with differences between the definitions of fetch for the browser built-in
// and the node-fetch polyfill for node
// Is there a better way to do this?
const fetchWrapper = (input?: string | Request, init?: RequestInit): Promise<Response> => {
  const anyInput = input as any
  const anyInit = init as any
  return fetch(anyInput, anyInit) as any
}

export class StateHistoryPostgresActionReader extends AbstractActionReader {
  private api: any
  private db: any
  private massiveInstance: massive.Database | null = null

  constructor(
    options: ActionReaderOptions,
    private rpcEndpoint: string,
    private massiveConfig: any,
    private dbSchema: string = 'chain',
  ) {
    super(options)
    const signatureProvider = new JsSignatureProvider([])

    const rpc = new JsonRpc(this.rpcEndpoint, { fetch: fetchWrapper } )
    this.api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })
  }

  public async getHeadBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return statusRow.head
  }

  public async getLastIrreversibleBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return statusRow.irreversible
  }

  public async getBlock(blockNumber: number): Promise<Block> {
    const pgBlockInfo = await this.db.block_info.findOne({
      block_index: blockNumber,
    })

    // Uses ${<var-name>} for JS substitutions and $<var-name> for massivejs substitutions.
    const query = `
      SELECT at.transaction_id, at.block_index, at.account,
              at.name, at_authorization.actor, at_authorization.permission,
              at.action_index, at.receipt_receiver, at.data
      FROM ${this.dbSchema}.action_trace AS at, ${this.dbSchema}.action_trace_authorization AS at_authorization
      WHERE at.block_index = $1 AND at.transaction_id = at_authorization.transaction_id
    `

    if (! this.massiveInstance) {
      throw new NotInitializedError('Massive was not initialized.')
    }

    const pgActionTraceAuthorizations = await this.massiveInstance.query(query, [blockNumber])

    const blockInfo = {
      blockNumber: pgBlockInfo.block_index,
      blockHash: pgBlockInfo.block_id,
      previousBlockHash: pgBlockInfo.previous,
      timestamp: pgBlockInfo.timestamp,
    }

    const actionPromises: Array<Promise<Action>> = pgActionTraceAuthorizations.map(async (actionTrace: any) => {
      const serializedAction = {
        account: actionTrace.account,
        name: actionTrace.name,
        authorization: [{
          actor: actionTrace.actor,
          permission: actionTrace.permission,
        }],
        data: actionTrace.data,
      }

      const [deserializedAction] = await this.deserializeActionTraces([serializedAction])

      const action = {
        type: `${actionTrace.account}::${actionTrace.name}`,
        payload: {
          ...deserializedAction,
          actionIndex: actionTrace.action_index,
          transactionId: actionTrace.transaction_id,
          notifiedAccounts: [actionTrace.receipt_receiver]
        }
      }
      return action
    })

    const actions = await Promise.all(actionPromises)

    return {
      blockInfo,
      actions,
    }
  }

  protected async setup(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      this.massiveInstance = await massive(this.massiveConfig)
      this.db = this.massiveInstance[this.dbSchema]
    } catch (err) {
      throw new NotInitializedError('', err)
    }
  }

  private async deserializeActionTraces(actionTraces: any): Promise<any> {
    const actions = await this.api.deserializeActions(actionTraces)
    return actions
  }
}
