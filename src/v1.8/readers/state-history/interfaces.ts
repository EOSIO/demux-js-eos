import { ActionReaderOptions } from 'demux'

export interface StateHistoryPostgresActionReaderOptions extends ActionReaderOptions {
  massiveConfig: any
  dbSchema?: string
  enablePgMonitor?: boolean
}
