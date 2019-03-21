import { ApiInterfaces } from 'eosjs'

export class StateHistoryPostgresAbiProvider implements ApiInterfaces.AbiProvider {
  private db: any

  constructor(
    private massiveInstance: any,
    private dbSchema: string = 'chain',
  ) {
    this.db = this.massiveInstance[this.dbSchema]
  }

  public async getRawAbi(accountName: string): Promise<ApiInterfaces.BinaryAbi> {
    const accountRow = await this.db.account.findOne({ name: accountName })

    const binaryAbi: ApiInterfaces.BinaryAbi = {
      accountName: accountRow.name,
      abi: accountRow.abi,
    }

    return binaryAbi
  }
}
