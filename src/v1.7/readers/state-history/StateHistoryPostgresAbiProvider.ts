import { ApiInterfaces } from 'eosjs'

export class StateHistoryPostgresAbiProvider implements ApiInterfaces.AbiProvider {
  public blockNumber: number = 0
  public massiveInstance: any = {}
  public dbSchema: string = 'chain'

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
