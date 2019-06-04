import { StateHistoryPostgresBlock } from './StateHistoryPostgresBlock'

describe('StateHistoryPostgresBlock', () => {
  let stateHistoryPostgresBlock: any

  beforeEach(async () => {
    stateHistoryPostgresBlock = new StateHistoryPostgresBlock(
      {
        block_num: 4,
        block_id: 'qwerty1234',
        previous: 'qwerty1233',
        timestamp: new Date('2018-08-12').toString(),
      },
      [{
        act_account: 'token',
        act_name: 'transfer',
        action_ordinal: 1,
        transaction_id: '12345',
        receipt_receiver: 'token',
        producer: 'eosio',
        authorizations: [['useraaaaaaaa', 'active']],
        context_free: false,
        data: [100, 100, 100, 100, 100, 100, 100],
        partial_context_free_data: [],
      }],
      [],
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
        actionOrdinal: 1,
        authorization: [{
          actor: 'useraaaaaaaa',
          permission: 'active'
        }],
        contextFreeData: [],
        data: {
          from: 'useraaaaaaaa',
          memo: '',
          quantity: '0.0100 EOS',
          to: 'userbbbbbbbb'
        },
        isContextFree: false,
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
        block_num: '4',
        block_id: 'qwerty1234',
        previous: 'qwerty1233',
        timestamp: new Date('2018-08-12').toString(),
      },
      [{
        act_account: 'token',
        act_name: 'transfer',
        action_ordinal: 1,
        transaction_id: '12345',
        receipt_receiver: 'userbbbbbbbb',
        authorizations: [['useraaaaaaaa', 'active']],
        data: [100, 100, 100, 100, 100, 100, 100],
      }],
      [],
      {},
    )
    await stateHistoryPostgresBlock.parseActions()

    expect(stateHistoryPostgresBlock.blockInfo.blockNumber).toEqual(4)
  })
})
