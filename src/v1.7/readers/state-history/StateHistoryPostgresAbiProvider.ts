import { ApiInterfaces } from 'eosjs'
import { Database } from 'massive'

export class StateHistoryPostgresAbiProvider implements ApiInterfaces.AbiProvider {
  public blockNumber: number = 0
  public massiveInstance: any = {}
  public dbSchema: string = 'chain'

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
        'block_index <=': this.blockNumber,
      },
      { order: [{
        field: 'block_index',
        direction: 'desc',
      }]}
    )
    return {
      accountName: accountRow.name,
      abi: accountRow.abi,
    }
  }
}
