const blockState = {
  block_id: "000000158d290b81581b6e6211a58afcecee0709ddf669292ddbac78f5a20450",
  block_header_state: {
    id: "000000158d290b81581b6e6211a58afcecee0709ddf669292ddbac78f5a20450",
    block_num: 21,
    header: {
      timestamp: "2018-08-08T14:32:27.500",
      producer: "eosio",
      confirmed: 0,
      previous: "000000145a68a7d281fadf4d0b59a50640c7ad53007a4291489ccbb3fc81e21b",
      transaction_mroot: "0000000000000000000000000000000000000000000000000000000000000000",
      action_mroot: "efa86481a3f714981580a9f1904abad1720a5d970cb4e73cbb9710f970119d48",
      schedule_version: 0,
      header_extensions: [],
      producer_signature: `SIG_K1_KbiKtD6ahpjg77EZmJ8nsfBVYiRgLVKp1W3rgV2peerm2nkBwZe4kni9
                        4JtAkd3uVdaSSf87atTdDnMM7Pp7Xe3RbJwTWg`,
    },
    dpos_proposed_irreversible_blocknum: 21,
    dpos_irreversible_blocknum: 20,
    bft_irreversible_blocknum: 0,
    pending_schedule_lib_num: 0,
    pending_schedule_hash: "828135c21a947b15cdbf4941ba09e1c9e0a80e88a157b0989e9b476b71a21c6b",
    pending_schedule: {
      version: 0,
      producers: [],
    },
    active_schedule: {
      version: 0,
      producers: [
        {
          producer_name: "eosio",
          block_signing_key: "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
        },
      ],
    },
    blockroot_merkle: {
      _active_nodes: [
        "e0cbc59b991297ed3bdd19254cc0c34eed0076c0bef6ac1ebd0b743b942fc0e9",
        "e33a599edd441c361a2a9a89b3a7fee6577c24187394e987d406a1a5a37bf318",
        "d839cf15f5c8d8b6a8bac4918a5ce06abcacd58176808de8b29f7af7b82ccac3",
      ],
      _node_count: 20,
    },
    producer_to_last_produced: [
      [
        "eosio",
        21,
      ],
    ],
    producer_to_last_implied_irb: [
      [
        "eosio",
        20,
      ],
    ],
    block_signing_key: "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV",
    confirm_count: [],
    confirmations: [],
  },
  block_num: 21,
  in_current_chain: true,
  validated: true,
}

const actionTraces = [
  {
    _id: '5c0fb6d93ffbf3000d484e24',
    receipt: {},
    act:
      {
        account: "eosio.token",
        name: "transfer",
        authorization: [{ actor: "bill", permission: "active" }],
        data: { from: "bill", to: "bob", quantity: "1.0000 EOS", memo: "m" },
      },
    elapsed: 6,
    console: '',
    trx_id: '051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83',
    block_num: 96615,
    block_time: "2018-06-09T11:56:30.000",
    producer_block_id: "0001796719f9556dca4dce19f7d83e3c390d76783193d59123706b7741686bac",
    account_ram_deltas: [],
    except: null,
    trx_status: "executed",
    createdAt: '2018-12-11T13:08:41.509Z'
  },
  {
    _id: '5c0fb6d93ffbf3000d484e24',
    receipt: {},
    act: {
      account: "eosio.token",
      name: "transfer",
      authorization: [{ actor: "bill", permission: "active" }],
      data: { from: "bill", to: "bob", quantity: "1.0000 EOS", memo: "m" },
    },
    elapsed: 6,
    console: '',
    trx_id: '051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83',
    block_num: 96615,
    block_time: "2018-06-09T11:56:30.000",
    producer_block_id: "0001796719f9556dca4dce19f7d83e3c390d76783193d59123706b7741686bac",
    account_ram_deltas: [],
    except: null,
    trx_status: "executed",
    createdAt: '2018-12-11T13:08:41.509Z'
  },
]

export const mockConnect = {
  db: () => ({
    collection: (col: any) => {
      if (col === "block_states") {
        return {
          find: () => ({
            limit: () => ({
              sort: () => ({
                toArray: () => [blockState],
              }),
            }),
            toArray: () => [blockState],
          }),
        }
      } else if (col === "action_traces") {
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
  }),
}
