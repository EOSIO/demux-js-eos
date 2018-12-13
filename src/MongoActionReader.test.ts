import { MongoActionReader } from "./MongoActionReader"
import { mockConnect } from "./testHelpers/mongoMock"

const { MongoClient } = require.requireActual("mongodb")
MongoClient.connect = jest.fn(() => mockConnect)

describe("MongoActionReader", () => {
  let reader: any

  beforeEach(async () => {
    reader = new MongoActionReader("mongodb://127.0.0.1:27017", 0, false, 600, "EOS")
    await reader.initialize()
  })

  it("getHeadBlockNumber returns the correct blockNumber", async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toEqual(21)
  })

  it("getBlock returns expected block", async () => {
    const returnedBlock = await reader.getBlock(21)
    expect(returnedBlock.blockInfo.blockNumber).toEqual(21)
  })
})
