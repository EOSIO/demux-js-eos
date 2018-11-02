import { NodeosActionReader } from "./NodeosActionReader"
import { nodeosRawBlock } from "./testHelpers/nodeosRawBlock"

describe("NodeosActionReader", () => {
  let request: any
  let reader: NodeosActionReader

  const blockInfo = {
    last_irreversible_block_num: 10,
    head_block_num: 20,
  }

  beforeAll(() => {
    request = {
      get: async () => blockInfo,
      post: async () => nodeosRawBlock,
    }
  })

  beforeEach(() => {
    reader = new NodeosActionReader("", 1, false, 600, request)
  })

  it("returns last irreversible block if configured", async () => {
    reader = new NodeosActionReader("", 1, true, 600, request)
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toBe(10)
  })

  it("returns head block if configured", async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toBe(20)
  })

  it("returns head block minus the number of required confirmations if configured", async () => {
    reader = new NodeosActionReader("", 1, false, 600, request, 2)
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toBe(18)
  })

  it("gets a block", async () => {
    const block = await reader.getBlock(20)
    expect(block).toEqual({
      actions: [
        {
          payload: {
            account: "testing",
            actionIndex: 0,
            authorization: [
              {
                actor: "testing",
                permission: "active",
              },
            ],
            data: {
              memo: "EOS is awesome!",
            },
            name: "action",
            transactionId: "b890beb84a6d1d77755f2e0cdad48e2ffcfd06ff3481917b4875cc5f3a343533",
          },
          type: "testing::action",
        },
        {
          payload: {
            account: "testing",
            actionIndex: 1,
            authorization: [
              {
                actor: "testing",
                permission: "active",
              },
            ],
            data: {
              memo: "Go EOS!",
            },
            name: "action2",
            transactionId: "b890beb84a6d1d77755f2e0cdad48e2ffcfd06ff3481917b4875cc5f3a343533",
          },
          type: "testing::action2",
        },
      ],
      blockInfo: {
        blockHash: "000f4241873a9aef0daefd47d8821495b6f61c4d1c73544419eb0ddc22a9e906",
        blockNumber: 20,
        previousBlockHash: "000f42401b5636c3c1d88f31fe0e503654091fb822b0ffe21c7d35837fc9f3d8",
        timestamp: new Date("2018-06-16T05:59:49.500"),
      },
    })
  })
})
