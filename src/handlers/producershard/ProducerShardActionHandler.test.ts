import { TestProducerShardActionHandler } from '../../testHelpers/TestProducerShardActionHandler'

describe('ProducerShardActionHandler', () => {
  let actionHandler: TestProducerShardActionHandler

  beforeAll(() => {
    actionHandler = new TestProducerShardActionHandler(
      [{
        versionName: 'v1',
        updaters: [],
        effects: []
      }],
      {},
      '',
      [],
      'testprod'
    )
  })

  it('only runs effects matching configured producer', () => {
    const run = jest.fn()
    const notRun = jest.fn()

    const effectRun = {
      actionType: 'testing::testing',
      run
    }

    const effectNotRun = {
      actionType: 'testing::testing',
      run: notRun
    }

    const payloadRun = {
      account: 'testing',
      actionIndex: 0,
      authorization: [],
      data: {},
      name: 'testing',
      producer: 'testprod',
      transactionId: '1234',
    }

    const payloadNotRun = {
      account: 'testing',
      actionIndex: 0,
      authorization: [],
      data: {},
      name: 'testing',
      producer: 'testprod2',
      transactionId: '1234',
    }

    const nextBlock = {
      block: {
        actions: [],
        blockInfo: {
          blockNumber: 2,
          blockHash: '213123',
          previousBlockHash: '213122',
          timestamp: new Date(),
        }
      },
      blockMeta: {
        isRollback: false,
        isEarliestBlock: false,
        isNewBlock: false,
      },
      lastIrreversibleBlockNumber: 1
    }

    actionHandler._runOrDeferEffect(effectRun, payloadRun, nextBlock, {})
    expect(run).toHaveBeenCalled()

    actionHandler._runOrDeferEffect(effectNotRun, payloadNotRun, nextBlock, {})
    expect(notRun).not.toHaveBeenCalled()
  })
})
