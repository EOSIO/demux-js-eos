import Docker from 'dockerode'
import massive from 'massive'
import path from 'path'
import { Migration } from 'demux-postgres'
import { StateHistoryPostgresActionReader } from './StateHistoryPostgresActionReader'
import * as dockerUtils from '../../../testHelpers/dockerUtils'
import { loadData } from '../../testHelpers/fillpgTestDataLoader'

jest.setTimeout(30000)

const docker = new Docker()
const postgresImageName = 'postgres:10.4'
const postgresContainerName = 'fill-pg-1.8-test'
const postgresHostPort = 6458
const dbName = 'statehistory18'
const dbUser = 'docker'
const dbPass = 'docker'
const schemaName = 'b1chain'

describe('StateHistoryPostgresActionReader', () => {
  let massiveInstance: massive.Database
  let reader: StateHistoryPostgresActionReader
  beforeAll(async (done) => {
    await dockerUtils.pullImage(docker, postgresImageName)
    await dockerUtils.removePostgresContainer(docker, postgresContainerName)
    await dockerUtils.startPostgresContainer(
      docker,
      postgresImageName,
      postgresContainerName,
      dbName,
      dbUser,
      dbPass,
      postgresHostPort,
    )
    massiveInstance = await massive({
      database: dbName,
      user: dbUser,
      password: dbPass,
      port: postgresHostPort,
    })
    reader = new StateHistoryPostgresActionReader({
      massiveConfig: {
        host: 'localhost',
        port: postgresHostPort,
        database: dbName,
        dbSchema: schemaName,
        user: 'docker',
        password: 'docker',
      },
      dbSchema: schemaName,
    })
    const schemaMigration = new Migration(
      'pgfill-1.8',
      schemaName,
      path.join(__dirname, '../', '../', 'testHelpers', 'fillpg-schema-1.8.sql')
    )
    await schemaMigration.up(massiveInstance.instance)
    await massiveInstance.reload()
    await loadData(massiveInstance[schemaName])
    await reader.initialize()

    done()
  })

  afterAll(async (done) => {
    await dockerUtils.removePostgresContainer(docker, postgresContainerName)
    done()
  })

  it('returns the head block number', async () => {
    const blockNum = await reader.getHeadBlockNumber()
    expect(blockNum).toEqual(5)
  })

  it('returns the last irreversible block number', async () => {
    const blockNum = await reader.getLastIrreversibleBlockNumber()
    expect(blockNum).toEqual(3)
  })

  it('returns expected block', async () => {
    const returnedBlock = await reader.getBlock(2)
    expect(returnedBlock.blockInfo.blockNumber).toEqual(2)
    expect(returnedBlock.actions.length).toEqual(3)
  })
})
