import { StateHistoryPostgresActionReader } from './StateHistoryPostgresActionReader'

describe('StateHistoryPostgresActionReader', () => {
  let reader: any
  beforeEach(async () => {
    reader = new StateHistoryPostgresActionReader(
      {},
      '',
      {
        host: 'localhost',
        port: 5432,
        database: 'statehistory',
        user: 'docker',
        password: 'docker'
      },
      'chain'
    )

    await reader.setup()
  })

  it('returns the head block number', async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toEqual(4)
  })

  it('returns the last irreversible block number', async () => {
    const blockNum = await reader.getLastIrreversibleBlockNumber()
    expect(blockNum).toEqual(3)
  })

  it('returns block with expected block number', async () => {
    const returnedBlock = await reader.getBlock(4)
    expect(returnedBlock.blockInfo.blockNumber).toEqual(4)
  })
})
