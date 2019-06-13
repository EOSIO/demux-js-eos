import { ApiInterfaces } from 'eosjs'
import { Database } from 'massive'

export class StateHistoryPostgresAbiProvider implements ApiInterfaces.AbiProvider {
  private blockNumber: number = 0
  private massiveInstance: any = {}
  private dbSchema: string = 'chain'

  public setState(blockNumber: number, massiveInstance?: Database, dbSchema?: string) {
    this.blockNumber = blockNumber
    if (massiveInstance) {
      this.massiveInstance = massiveInstance
    }
    if (dbSchema) {
      this.dbSchema = dbSchema
    }
  }

  public async getRawAbi(accountName: string): Promise<ApiInterfaces.BinaryAbi> {
    const db = this.massiveInstance[this.dbSchema]
    const accountRow = await db.account.findOne(
      {
        'name': accountName,
        'block_num <=': this.blockNumber,
      },
      { order: [{
        field: 'block_num',
        direction: 'desc',
      }]}
    )
    return {
      accountName: accountRow.name,
      abi: accountRow.abi,
    }
  }
}
