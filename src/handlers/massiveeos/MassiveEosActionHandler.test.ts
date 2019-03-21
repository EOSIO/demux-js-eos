import { TestMassiveEosActionHandler } from '../../testHelpers/TestMassiveEosActionHandler'

describe('MassiveEosActionHandler implements matchActionType method', () => {
  let actionHandler: TestMassiveEosActionHandler

  beforeAll(() => {
    actionHandler = new TestMassiveEosActionHandler([
      {
        versionName: 'v1',
        updaters: [],
        effects: []
      }
    ],
    {})
  })

  it('matches on exact matches', () => {
    const match = actionHandler._matchActionType('eosio.token::issue', 'eosio.token::issue')
    const dontMatch = actionHandler._matchActionType('eosio::issue', 'eosio.token::issue')
    expect(match).toEqual(true)
    expect(dontMatch).toEqual(false)
  })

  it('matches on wildcarded contract', () => {
    const match = actionHandler._matchActionType('eosio.token::issue', '*::issue')
    const dontMatch = actionHandler._matchActionType('eosio::issue', '*::bid')
    expect(match).toEqual(true)
    expect(dontMatch).toEqual(false)
  })

  it('matches on wildcarded action', () => {
    const match = actionHandler._matchActionType('eosio.token::issue', 'eosio.token::*')
    const dontMatch = actionHandler._matchActionType('eosio::issue', 'eosio.token::*')
    expect(match).toEqual(true)
    expect(dontMatch).toEqual(false)
  })

  it('matches on wildcarded contracts and actions', () => {
    const match = actionHandler._matchActionType('eosio.token::issue', '*::*')
    expect(match).toEqual(true)
  })
})
