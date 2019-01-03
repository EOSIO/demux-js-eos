import { MongoBlock } from "./MongoBlock"
import { mongoBlockState, mongoRawActions } from "./testHelpers/mongoObjectMocks"


describe("MongoBlock", () => {
  let mongoBlock: any

  beforeEach(() => {
    mongoBlock = new MongoBlock(mongoBlockState, mongoRawActions)
  })

  it("collects actions from blocks", () => {
    expect(mongoBlock).toEqual({
      actions: [
        {
          payload: {
            account: "eosio.token",
            actionIndex: 0,
            authorization: [
              {
                actor: "bill",
                permission: "active",
              },
            ],
            data: {
              from: "bill",
              memo: "m",
              quantity: "1.0000 EOS",
              to: "bob",
            },
            name: "transfer",
            notifiedAccounts: ["bill", "bob"],
            transactionId: "051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83",
          },
          type: "eosio.token::transfer",
        },
        {
          payload: {
            account: "eosio.token",
            actionIndex: 1,
            authorization: [
              {
                actor: "bill",
                permission: "active",
              },
            ],
            data: {
              from: "bill",
              memo: "m",
              quantity: "1.0000 EOS",
              to: "bob",
            },
            name: "transfer",
            notifiedAccounts: ["bill", "bob"],
            transactionId: "051620080b3212292f56a836c6b2f294291f6e6793dc0f12ce6a886f83d97f83",
          },
          type: "eosio.token::transfer",
        },
      ],
      blockInfo: {
        blockHash: "0001796719f9556dca4dce19f7d83e3c390d76783193d59123706b7741686bac",
        blockNumber: 96615,
        previousBlockHash: "0001796619c493e432bcf8105d45d1c7457b58f636c89bae3f1bda6574ff7502",
        timestamp: new Date("2018-08-13T22:59:46.000"),
      },
    })
  })
})
