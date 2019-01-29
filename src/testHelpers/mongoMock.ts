import { blockStates } from './blockStates'
const actionTraces = [
  {
    _id: '5c0fb6d93ffbf3000d484e24',
    receipt: {},
    act: {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{ actor: 'bill', permission: 'active' }],
      data: { from: 'bill', to: 'bob', quantity: '1.0000 EOS', memo: 'm' },
    },
    elapsed: 6,
    console: '',
    trx_id: '051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83',
    block_num: 96615,
    block_time: '2018-06-09T11:56:30.000',
    producer_block_id: '0001796719f9556dca4dce19f7d83e3c390d76783193d59123706b7741686bac',
    account_ram_deltas: [],
    except: null,
    trx_status: 'executed',
    createdAt: '2018-12-11T13:08:41.509Z',
  },
  {
    _id: '5c0fb6d93ffbf3000d484e24',
    receipt: {},
    act: {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{ actor: 'bill', permission: 'active' }],
      data: { from: 'bill', to: 'bob', quantity: '1.0000 EOS', memo: 'm' },
    },
    elapsed: 6,
    console: '',
    trx_id: '051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83',
    block_num: 96615,
    block_time: '2018-06-09T11:56:30.000',
    producer_block_id: '0001796719f9556dca4dce19f7d83e3c390d76783193d59123706b7741686bac',
    account_ram_deltas: [],
    except: null,
    trx_status: 'executed',
    createdAt: '2018-12-11T13:08:41.509Z',
  },
]

export const mockConnect = {
  db: (name: string) => {
    if (name === 'failed') {
      return {
        collection: (col: any) => {
          if (col === 'block_states') {
            return {
              find: () => ({
                limit: () => ({
                  sort: () => ({
                    toArray: () => blockStates,
                  }),
                }),
                toArray: () => blockStates,
              }),
            }
          } else if (col === 'action_traces') {
            return ({
              find: () => ({
                sort: () => ({
                  toArray: () => actionTraces,
                }),
              }),
            })
          }
          return
        },
        collections: () => {
          return []
        }
      }
    } else {
      return {
        collection: (col: any) => {
          if (col === 'block_states') {
            return {
              find: () => ({
                limit: () => ({
                  sort: () => ({
                    toArray: () => blockStates,
                  }),
                }),
                toArray: () => blockStates,
              }),
            }
          } else if (col === 'action_traces') {
            return ({
              find: () => ({
                sort: () => ({
                  toArray: () => actionTraces,
                }),
              }),
            })
          }
          return
        },
        collections: () => {
          return [
            {
              collectionName: 'action_traces'
            },
            {
              collectionName: 'block_states'
            },
          ]
        }
      }
    }
  }
}
