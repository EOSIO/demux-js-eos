import { AbstractActionReader, NotInitializedError } from 'demux'
import massive from 'massive'
import pgMonitor from 'pg-monitor'
import { StateHistoryPostgresActionReaderOptions } from '../../interfaces'
import { StateHistoryPostgresBlock } from './StateHistoryPostgresBlock'

export class StateHistoryPostgresActionReader extends AbstractActionReader {
  private db: any
  private massiveInstance: massive.Database | null = null
  private massiveConfig: any
  private dbSchema: string
  private enablePgMonitor: boolean

  constructor(options: StateHistoryPostgresActionReaderOptions) {
    super(options)
    this.massiveConfig = options.massiveConfig
    this.dbSchema = options.dbSchema ? options.dbSchema : 'chain'
    this.enablePgMonitor = options.enablePgMonitor ? true : false
  }

  public async getHeadBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.head)
  }

  public async getLastIrreversibleBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.irreversible)
  }

  public async getBlock(blockNumber: number): Promise<StateHistoryPostgresBlock> {
    const pgBlockInfo = await this.db.block_info.findOne({
      block_index: blockNumber,
    })

    // Uses ${<var-name>} for JS substitutions and $<var-name> for massivejs substitutions.
    const query = `
      SELECT at.account,
             at.name,
             at.data,
             at.transaction_id,
             at.action_ordinal,
             at.creator_action_ordinal,
             at.receipt_global_sequence,
             at.context_free,
             at.receipt_receiver,
             at.block_num,
             at_authorization.actor,
             at_authorization.permission,
             tt.transaction_ordinal,
             tt.partial_context_free_data,
             bi.producer
      FROM ${this.dbSchema}.action_trace AS at,
           ${this.dbSchema}.action_trace_authorization AS at_authorization,
           ${this.dbSchema}.block_info as bi,
           ${this.dbSchema}.transaction_trace as tt
      WHERE at.receipt_present = true AND
            tt.id = at.transaction_id AND
            at.block_num = $1 AND
            at.transaction_id = at_authorization.transaction_id AND
            bi.block_num = at.block_num
      ORDER BY at.receipt_global_sequence
    `

    if (! this.massiveInstance) {
      throw new NotInitializedError('Massive was not initialized.')
    }

    const pgActionTraceAuthorizations = await this.massiveInstance.query(query, [blockNumber])

    const block = new StateHistoryPostgresBlock(
      pgBlockInfo,
      pgActionTraceAuthorizations,
      this.massiveInstance,
      this.dbSchema,
    )
    await block.parseActions()
    return block
  }

  protected async setup(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      this.massiveInstance = await massive(this.massiveConfig)
      if (this.enablePgMonitor) {
        await pgMonitor.attach(this.massiveInstance.driverConfig)
      }
      this.db = this.massiveInstance[this.dbSchema]
    } catch (err) {
      throw new NotInitializedError('', err)
    }
  }
}
