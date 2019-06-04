import { Action, ActionReaderOptions } from 'demux'

export interface NodeosActionReaderOptions extends ActionReaderOptions {
  nodeosEndpoint?: string
}

export interface MongoActionReaderOptions extends ActionReaderOptions {
  mongoEndpoint?: string
  dbName?: string
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
  receiver?: string
  isContextFree?: boolean
  isInline?: boolean
  isNotification?: boolean
  contextFreeData?: Buffer[]
  transactionActions?: TransactionActions
}

export interface EosAction<ActionStruct = any> extends Action {
  payload: EosPayload<ActionStruct>
}

export interface TransactionActions {
  contextFreeActions: EosAction[]
  actions: EosAction[]
  inlineActions: EosAction[]
}
