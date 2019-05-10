import { Action, ActionReaderOptions } from 'demux'

export interface NodeosActionReaderOptions extends ActionReaderOptions {
  nodeosEndpoint?: string
}

export interface MongoActionReaderOptions extends ActionReaderOptions {
  mongoEndpoint?: string
  dbName?: string
}

export interface StateHistoryPostgresActionReaderOptions extends ActionReaderOptions {
  massiveConfig: any
  dbSchema?: string
  enablePgMonitor?: boolean
}

export interface EosAuthorization {
  actor: string
  permission: string
}

export interface EosPayload<ActionStruct = any> {
  account: string
  authorization: EosAuthorization[]
  data: ActionStruct
  name: string
  transactionId: string
  actionIndex?: number
  actionOrdinal?: number
  producer?: string
  notifiedAccounts?: string[]
  isContextFree?: boolean
  isInline?: boolean
  contextFreeData?: Buffer[]
  transactionActions?: TransactionActions
}

export interface EosAction extends Action {
  payload: EosPayload
}

export interface TransactionActions {
  contextFreeActions: EosAction[]
  actions: EosAction[]
  inlineActions: EosAction[]
}
