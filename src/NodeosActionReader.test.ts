import { NotInitializedError } from 'demux'
import request from 'request-promise-native'
import { NodeosActionReader } from './NodeosActionReader'
import { nodeosRawBlock } from './testHelpers/nodeosRawBlock'

describe('NodeosActionReader', () => {
  let reader: NodeosActionReader

  const blockInfo = {
    last_irreversible_block_num: 10,
    head_block_num: 20,
  }

  beforeAll(() => {
    request.get = jest.fn(async () => blockInfo)
    request.post = jest.fn(async () => nodeosRawBlock)
  })

  beforeEach(() => {
    reader = new NodeosActionReader('', 10, false)
  })

  it('returns head block number', async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toBe(20)
  })

  it('returns last irreversible block number', async () => {
    const blockNum = await reader.getLastIrreversibleBlockNumber()
    expect(blockNum).toBe(10)
  })

  it('gets block with correct block number', async () => {
    const block = await reader.getBlock(20)
    expect(block.blockInfo.blockNumber).toEqual(20)
  })

  it('throws if not correctly initialized', async () => {
    request.get = jest.fn(async () => { throw new Error() })
    reader.getLastIrreversibleBlockNumber = jest.fn(() => blockInfo)
    const result = reader.getNextBlock()
    expect(result).rejects.toThrow(NotInitializedError)
  })
})
