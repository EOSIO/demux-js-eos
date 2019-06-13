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
        name: 'transfer',
        transaction_id: '12345',
        action_index: 1,
        parent_action_index: 0,
        data: [100, 100, 100, 100, 100, 100, 100],
        receipt_global_sequence: 1,
        receipt_receiver: 'token',
        block_index: '4',
        authorizations: [['useraaaaaaaa', 'active']],
        producer: 'eosio',
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
    const actions = [{
      payload: {
        account: 'token',
        actionIndex: 1,
        authorization: [{
          actor: 'useraaaaaaaa',
          permission: 'active'
        }],
        data: {
          from: 'useraaaaaaaa',
          memo: '',
          quantity: '0.0100 EOS',
          to: 'userbbbbbbbb'
        },
        isInline: false,
        isNotification: false,
        name: 'transfer',
        receiver: 'token',
        producer: 'eosio',
        transactionActions: {
          actions: [] as any[],
          contextFreeActions: [],
          inlineActions: []
        },
        transactionId: '12345'
      },
      type: 'token::transfer'
    }]
    actions[0].payload.transactionActions.actions.push(actions[0])

    expect(stateHistoryPostgresBlock.actions).toEqual(actions)
  })

  it('handles blockNumber as string', async () => {
    stateHistoryPostgresBlock = new StateHistoryPostgresBlock(
      {
        block_index: '4',
        block_id: 'qwerty1234',
        previous: 'qwerty1233',
        timestamp: new Date('2018-08-12').toString(),
      },
      [{
        account: 'token',
        name: 'transfer',
        data: [100, 100, 100, 100, 100, 100, 100],
        transaction_id: '12345',
        action_index: 1,
        parent_action_index: 0,
        receipt_global_sequence: 1,
        receipt_receiver: 'userbbbbbbbb',
        block_index: '4',
        authorizations: [['useraaaaaaaa', 'active']],
        producer: 'eosio',
      }],
      {},
    )
    await stateHistoryPostgresBlock.parseActions()

    expect(stateHistoryPostgresBlock.blockInfo.blockNumber).toEqual(4)
  })
})
