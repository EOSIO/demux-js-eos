import { Action, ActionReaderOptions } from 'demux'

export interface NodeosActionReaderOptions extends ActionReaderOptions {
  nodeosEndpoint?: string
}

export interface EosAuthorization {
  actor: string
  permission: string
}

export interface EosPayload {
  account: string
  actionIndex: number
  authorization: EosAuthorization[]
  data: any
  name: string
  transactionId: string
  notifiedAccounts?: string[]
}

export interface EosAction extends Action {
  payload: EosPayload
}
