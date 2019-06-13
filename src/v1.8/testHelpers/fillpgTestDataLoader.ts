import { Database } from 'massive'

/* fill_status Schema:
    head bigint,
    head_id character varying(64),
    irreversible bigint,
    irreversible_id character varying(64),
    first bigint
 */
const fillStatus = async (db: Database) => {
  await db.fill_status.insert({
    head: 5,
    head_id: '0000000000000000000000000000000000000000000000000000000000000005',
    irreversible: 3,
    irreversible_id: '0000000000000000000000000000000000000000000000000000000000000003',
    first: 1,
  })
}

/* block_info Schema:
    block_num bigint NOT NULL,
    block_id character varying(64),
    "timestamp" timestamp without time zone,
    producer character varying(13),
    confirmed integer,
    previous character varying(64),
    transaction_mroot character varying(64),
    action_mroot character varying(64),
    schedule_version bigint,
    new_producers_version bigint,
    new_producers "${schema^}".producer_key[]
 */
const blockInfo = async (db: Database) => {
  const time = new Date('2019-06-12 14:56:50')
  const getIncrementedTime = () => {
    const isoString = new Date(time.setMilliseconds(time.getMilliseconds() + 500)).toISOString()
    return isoString.slice(0, 23).replace('T', ' ')
  }
  const defaultValues = {
    producer: 'eosio',
    confirmed: 0,
    transaction_mroot: 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    action_mroot: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    schedule_version: 0,
    new_producers_version: 0,
    new_producers: null,
  }
  // First block is special
  await db.block_info.insert({
    ...defaultValues,
    block_num: 1,
    block_id: '0000000000000000000000000000000000000000000000000000000000000001',
    timestamp: '2018-06-01 12:00:00',
    producer: '',
    confirmed: 1,
    previous: '',
    transaction_mroot: '',
  })
  await db.block_info.insert({
    ...defaultValues,
    block_num: 2,
    block_id: '0000000000000000000000000000000000000000000000000000000000000002',
    previous: '0000000000000000000000000000000000000000000000000000000000000001',
    timestamp: getIncrementedTime(),
  })
  await db.block_info.insert({
    ...defaultValues,
    block_num: 3,
    block_id: '0000000000000000000000000000000000000000000000000000000000000003',
    previous: '0000000000000000000000000000000000000000000000000000000000000002',
    timestamp: getIncrementedTime(),
  })
  await db.block_info.insert({
    ...defaultValues,
    block_num: 4,
    block_id: '0000000000000000000000000000000000000000000000000000000000000004',
    previous: '0000000000000000000000000000000000000000000000000000000000000003',
    timestamp: getIncrementedTime(),
  })
  await db.block_info.insert({
    ...defaultValues,
    block_num: 5,
    block_id: '0000000000000000000000000000000000000000000000000000000000000005',
    previous: '0000000000000000000000000000000000000000000000000000000000000004',
    timestamp: getIncrementedTime(),
  })
}

/* action_trace Schema:
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    transaction_status transaction_status_type,
    action_ordinal integer NOT NULL,
    creator_action_ordinal integer,
    receipt_present boolean,
    receipt_receiver character varying(13),
    receipt_act_digest character varying(64),
    receipt_global_sequence numeric,
    receipt_recv_sequence numeric,
    receipt_code_sequence bigint,
    receipt_abi_sequence bigint,
    receiver
    act_account character varying(13),
    act_name character varying(13),
    act_data bytea,
    context_free boolean,
    elapsed bigint,
    console character varying,
    "except" character varying
    error_code numeric
 */
const actionTrace = async (db: Database) => {
  let globalSequence = 0
  const getIncrementedGlobalSequence = () => globalSequence += 1
  const defaultValues = {
    transaction_status: 'executed',
    creator_action_ordinal: 0,
    receipt_present: true,
    receipt_act_digest: 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    receipt_recv_sequence: 0,
    receipt_code_sequence: 0,
    receipt_abi_sequence: 0,
    act_data: Buffer.from('This is some data'),
    context_free: false,
    elapsed: 0,
    console: '',
    except: '',
    error_code: 0,
  }
  await db.action_trace.insert({
    ...defaultValues,
    block_num: 2,
    transaction_id: '1111111111111111111111111111111111111111111111111111111111111111',
    action_ordinal: 1,
    receipt_global_sequence: getIncrementedGlobalSequence(),
    receipt_receiver: 'eosio.token',
    receiver: 'eosio.token',
    act_account: 'eosio.token',
    act_name: 'transfer',
  })
  await db.action_trace.insert({
    ...defaultValues,
    block_num: 2,
    transaction_id: '1111111111111111111111111111111111111111111111111111111111111111',
    action_ordinal: 2,
    receipt_global_sequence: getIncrementedGlobalSequence(),
    receipt_receiver: 'eosio.token',
    receiver: 'eosio.token',
    act_account: 'eosio.token',
    act_name: 'transfer',
  })
  await db.action_trace.insert({
    ...defaultValues,
    block_num: 2,
    transaction_id: '2222222222222222222222222222222222222222222222222222222222222222',
    action_ordinal: 1,
    receipt_global_sequence: getIncrementedGlobalSequence(),
    receipt_receiver: 'eosio.token',
    receiver: 'eosio.token',
    act_account: 'eosio.token',
    act_name: 'transfer',
  })
  await db.action_trace.insert({
    ...defaultValues,
    block_num: 4,
    transaction_id: '3333333333333333333333333333333333333333333333333333333333333333',
    action_ordinal: 1,
    receipt_global_sequence: getIncrementedGlobalSequence(),
    receipt_receiver: 'eosio.token',
    receiver: 'eosio.token',
    act_account: 'eosio.token',
    act_name: 'transfer',
  })
}

/* action_trace_authorization Schema:
    block_num bigint NOT NULL,
    transaction_id character varying(64) NOT NULL,
    action_ordinal integer NOT NULL,
    ordinal integer NOT NULL,
    transaction_status "${schema^}".transaction_status_type,
    actor character varying(13),
    permission character varying(13)

   Primary key constraint:
    action_trace_auth_sequence_pkey PRIMARY KEY (block_num, transaction_id, action_ordinal, index)
 */
const actionTraceAuthorization = async (db: Database) => {
  const defaultValues = {
    transaction_status: 'executed',
    permission: 'active',
  }
  let ordinal = 0
  for (const account of ['myaccount1', 'myaccount2']) {
    ordinal += 1
    for (const actionOrdinal of [1, 2]) {
      await db.action_trace_authorization.insert({
        ...defaultValues,
        block_num: 2,
        transaction_id: '1111111111111111111111111111111111111111111111111111111111111111',
        action_ordinal: actionOrdinal,
        ordinal,
        actor: account,
      })
    }
  }
  await db.action_trace_authorization.insert({
    ...defaultValues,
    block_num: 2,
    transaction_id: '2222222222222222222222222222222222222222222222222222222222222222',
    action_ordinal: 1,
    ordinal: 1,
    actor: 'myaccount1',
  })
  await db.action_trace_authorization.insert({
    ...defaultValues,
    block_num: 4,
    transaction_id: '3333333333333333333333333333333333333333333333333333333333333333',
    action_ordinal: 1,
    ordinal: 1,
    actor: 'myaccount2',
  })
}

export const loadData = async (db: Database) => {
  await fillStatus(db)
  await blockInfo(db)
  await actionTrace(db)
  await actionTraceAuthorization(db)
}
