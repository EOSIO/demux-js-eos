import { StateHistoryPostgresAbiProvider } from './StateHistoryPostgresAbiProvider'

describe('StateHistoryPostgresAbiProvider', () => {
  let stateHistoryPostgresAbiProvider: any

  beforeEach(() => {
    const massiveMock = {
      chain: {
        account: {
          findOne: () => ({
            name: 'test',
            abi: [10, 11, 12],
          }),
        },
      }
    }
    stateHistoryPostgresAbiProvider = new StateHistoryPostgresAbiProvider(massiveMock)
  })
  it('retrieves abis', async () => {
    const abi = await stateHistoryPostgresAbiProvider.getRawAbi('test')
    expect(abi).toEqual({
      accountName: 'test',
      abi: [10, 11, 12],
    })
  })
})
