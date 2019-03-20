import { StateHistoryPostgresBlock } from './StateHistoryPostgresBlock'

describe('StateHistoryPostgresBlock', () => {
  let stateHistoryPostgresBlock: any

  beforeEach(async () => {
    stateHistoryPostgresBlock = new StateHistoryPostgresBlock(
      {
        block_index: 4,
        block_id: 'qwerty1234',
        previous: 'qwerty1233',
        timestamp: new Date('2018-08-12').toString(),
      },
      [{
        account: 'token',
        action_index: 1,
        transaction_id: '12345',
        receipt_receiver: 'userbbbbbbbb',
        name: 'transfer',
        actor: 'useraaaaaaaa',
        permission: 'active',
        data: [100, 100, 100, 100, 100, 100, 100],
      }],
      {},
    )
    await stateHistoryPostgresBlock.parseActions()
  })

  it('collects blockInfo from blocks', () => {
    expect(stateHistoryPostgresBlock.blockInfo).toEqual({
      blockHash: 'qwerty1234',
      blockNumber: 4,
      previousBlockHash: 'qwerty1233',
      timestamp: new Date('2018-08-12').toString(),
    })
  })

  it('collects actions from blocks', () => {
    expect(stateHistoryPostgresBlock.actions).toEqual([{
      type: 'token::transfer',
      payload: {
        account: 'token',
        name: 'transfer',
        authorization: [{
          actor: 'useraaaaaaaa',
          permission: 'active',
        }],
        data: {
          from: 'useraaaaaaaa',
          to: 'userbbbbbbbb',
          memo: '',
          quantity: '0.0100 EOS',
        },
        actionIndex: 1,
        transactionId: '12345',
        notifiedAccounts: ['userbbbbbbbb'],
      }
    }])
  })

  it('handles blockNumber as string', async () => {
    stateHistoryPostgresBlock = new StateHistoryPostgresBlock(
      {
        block_index: "4",
        block_id: 'qwerty1234',
        previous: 'qwerty1233',
        timestamp: new Date('2018-08-12').toString(),
      },
      [{
        account: 'token',
        action_index: 1,
        transaction_id: '12345',
        receipt_receiver: 'userbbbbbbbb',
        name: 'transfer',
        actor: 'useraaaaaaaa',
        permission: 'active',
        data: [100, 100, 100, 100, 100, 100, 100],
      }],
      {},
    )
    await stateHistoryPostgresBlock.parseActions()

    expect(stateHistoryPostgresBlock.blockInfo.blockNumber).toEqual(4);
  })
})
