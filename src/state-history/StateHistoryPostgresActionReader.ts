import { AbstractActionReader, ActionReaderOptions, NotInitializedError } from 'demux'
import massive from 'massive'
import { StateHistoryPostgresBlock } from './StateHistoryPostgresBlock'

export class StateHistoryPostgresActionReader extends AbstractActionReader {
  private db: any
  private massiveInstance: massive.Database | null = null

  constructor(
    options: ActionReaderOptions,
    private massiveConfig: any,
    private dbSchema: string = 'chain',
  ) {
    super(options)
  }

  public async getHeadBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return statusRow.head
  }

  public async getLastIrreversibleBlockNumber(): Promise<number> {
    const statusRow = await this.db.fill_status.findOne()
    return statusRow.irreversible
  }

  public async getBlock(blockNumber: number): Promise<StateHistoryPostgresBlock> {
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
      this.db = this.massiveInstance[this.dbSchema]
    } catch (err) {
      throw new NotInitializedError('', err)
    }
  }
}
