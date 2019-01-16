import { MongoClient } from 'mongodb'
import { MongoActionReader } from './MongoActionReader'
import { mockConnect } from './testHelpers/mongoMock'

MongoClient.connect = jest.fn(() => mockConnect)

describe('MongoActionReader', () => {
  let reader: any

  beforeEach(async () => {
    reader = new MongoActionReader('mongodb://127.0.0.1:27017', 0, false, 600, 'EOS')
    await reader.initialize()
  })

  it('returns the head block number', async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toEqual(21)
  })

  it('returns the last irreversible block number', async () => {
    const blockNum = await reader.getLastIrreversibleBlockNumber()
    expect(blockNum).toEqual(20)
  })

  it('returns block with the expected block number', async () => {
    const returnedBlock = await reader.getBlock(21)
    expect(returnedBlock.blockInfo.blockNumber).toEqual(21)
  })
})
