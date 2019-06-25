import { AbstractActionReader, Block, NotInitializedError } from 'demux'
import massive from 'massive'
import pgMonitor from 'pg-monitor'
import { StateHistoryPostgresActionReaderOptions } from './interfaces'
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
    this.enablePgMonitor = !!options.enablePgMonitor
  }

  public async getHeadBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.head)
  }

  public async getLastIrreversibleBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return Number(statusRow.irreversible)
  }

  public async getBlock(blockNumber: number): Promise<Block> {
    const pgBlockInfo = await this.db.block_info.findOne({
      block_index: blockNumber,
    })

    // Uses ${<var-name>} for JS substitutions and $<number> for massivejs substitutions.
    const actionTracesQuery = `
      SELECT at.account,
             at.name,
             at.data,
             at.transaction_id,
             at.action_index,
             at.parent_action_index,
             at.receipt_global_sequence,
             at.receipt_receiver,
             at.block_index,
             array_agg( '[' || at_authorization.actor || ',' || at_authorization.permission || ']') as authorizations,
             bi.producer
      FROM ${this.dbSchema}.action_trace AS at,
           ${this.dbSchema}.action_trace_authorization AS at_authorization,
           ${this.dbSchema}.block_info as bi
      WHERE at.block_index = $1 AND
            at.transaction_id = at_authorization.transaction_id AND
            bi.block_index = at.block_index
      GROUP BY at.account,
               at.name,
               at.data,
               at.transaction_id,
               at.action_index,
               at.parent_action_index,
               at.receipt_global_sequence,
               at.receipt_receiver,
               at.block_index,
               bi.producer
      ORDER BY at.receipt_global_sequence
    `

    if (!this.massiveInstance) {
      throw new NotInitializedError('Massive was not initialized.')
    }

    const pgActionTraceAuthorizations = await this.massiveInstance.query(actionTracesQuery, [blockNumber])

    const block = new StateHistoryPostgresBlock(
      pgBlockInfo,
      pgActionTraceAuthorizations,
      this.massiveInstance,
      this.dbSchema,
      this.log,
    )
    await block.parseActions()
    return {
      actions: block.actions,
      blockInfo: block.blockInfo,
    }
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
      await this.addDbIndex('action_trace', 'transaction_id', 'transaction_id_idx1')
      await this.addDbIndex('action_trace_authorization', 'transaction_id', 'transaction_id_idx2')
    } catch (err) {
      throw new NotInitializedError('', err)
    }
  }

  protected async addDbIndex(tableName: string, columnName: string, indexName: string = `${columnName}_idx`) {
    if (this.massiveInstance) {
      await this.massiveInstance.query(`
        CREATE INDEX IF NOT EXISTS ${indexName} ON ${this.dbSchema}.${tableName} (${columnName})
      `)
    } else {
      throw Error('this.massiveInstance should already be set.')
    }
  }
}
