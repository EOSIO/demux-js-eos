class Api {
  deserializeActions(actionTraces) {
    const returnVals = []
    for (const at of actionTraces) {
      returnVals.push({
        account: at.account,
        name: at.name,
        authorization: at.authorization,
        data: {
          from: 'useraaaaaaaa',
          to: 'userbbbbbbbb',
          quantity: '0.0100 EOS',
          memo: ''
        }
      })
    }
    return returnVals
  }
}

class JsonRpc {}

module.exports = {
  Api,
  JsonRpc
}