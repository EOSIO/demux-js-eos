import { MongoClient } from 'mongodb'
import { MongoNotInitializedError } from './errors'
import { MongoActionReader } from './MongoActionReader'
import { mockConnect } from './testHelpers/mongoMock'

describe('MongoActionReader', () => {
  let reader: any

  beforeEach(async () => {
    MongoClient.connect = jest.fn(() => mockConnect)
    reader = new MongoActionReader('mongodb://127.0.0.1:27017', 0, false, 600, 'EOS')
  })

  it('returns the head block number', async () => {
    await reader.initialize()
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toEqual(21)
  })

  it('returns the last irreversible block number', async () => {
    await reader.initialize()
    const blockNum = await reader.getLastIrreversibleBlockNumber()
    expect(blockNum).toEqual(2)
  })

  it('returns block with the expected block number', async () => {
    await reader.initialize()
    const returnedBlock = await reader.getBlock(3)
    expect(returnedBlock.blockInfo.blockNumber).toEqual(3)
  })

  it('throws if isSetup false', async () => {
    const failedSetupReader = new MongoActionReader('mongodb://127.0.0.1:27017', 0, false, 600, 'failed')
    const result = failedSetupReader.getNextBlock()
    expect(result).rejects.toThrow(MongoNotInitializedError)
  })
})
