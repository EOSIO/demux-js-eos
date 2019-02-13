const massive = () => {
  return {
    chain: {
      account: {
        findOne: () => ({
          account_name: 'test',
          abi: [10, 11, 12],
        }),
      },
      fill_status: {
        findOne: () => ({
          head: 4,
          irreversible: 3,
        }),
      },
      block_info: {
        findOne: () => ({
          block_index: 4,
          block_id: 'qwerty1234',
          previous: 'qwerty1233',
          timestamp: new Date().toString(),
        }),
      }
    },
    query: () => ([
      {
        account: 'token',
        name: 'transfer',
        authorization: [{
          actor: 'useraaaaaaaa',
          permission: 'active',
        }],
        data: [100, 100, 100, 100, 100, 100, 100],
      }
    ]),
  }
}

module.exports = massive