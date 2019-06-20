import { TestActionHandler } from '../../testHelpers/TestActionHandler'
import { Database } from 'massive'

describe('MassiveEosActionHandler', () => {
  let actionHandler: TestActionHandler

  beforeAll(() => {
    actionHandler = new TestActionHandler(
      [{
        versionName: 'v1',
        updaters: [],
        effects: []
      }],
      {} as Database,
      [],
      { logLevel: 'error' }
    )
  })

  describe('validateActionType', () => {
    const shouldPass = [
      'contract::action',
      'contract::*',
      '*::action',
      'contract::action>notified',
      'contract::action>*',
      '*::*>*',
    ]

    const shouldFail = [
      'doesntwork',
      'doesnt:work',
      '::nope',
      'nada::',
      'DoNot::Capitalize',
      'thisoneiswaytoo::long',
      'blank::notified>',
      'blank::>action',
      'asterisks::**',
      'asterisks2::*abc',
    ]

    it('all passes validation', () => {
      for (const actionType of shouldPass) {
        expect(actionHandler._validateActionType(actionType)).toBe(true)
      }
    })

    it('all fails validation', () => {
      for (const actionType of shouldFail) {
        expect(actionHandler._validateActionType(actionType)).toBe(false)
      }
    })
  })

  describe('matchActionType', () => {
    it('matches on exact matches', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue',
        { receiver: 'eosio.token', isNotification: false },
      )
      const dontMatch = actionHandler._matchActionType(
        'eosio::issue',
        'eosio.token::issue',
        { receiver: 'eosio.token' },
      )
      expect(match).toEqual(true)
      expect(dontMatch).toEqual(false)
    })

    it('matches on wildcarded contract', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        '*::issue',
        { receiver: 'eosio.token', isNotification: false },
      )
      const dontMatch = actionHandler._matchActionType(
        'eosio::issue',
        '*::bid',
        { receiver: 'eosio.token', isNotification: false },
      )
      expect(match).toEqual(true)
      expect(dontMatch).toEqual(false)
    })

    it('matches on wildcarded action', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::*',
        { receiver: 'eosio.token', isNotification: false },
      )
      const dontMatch = actionHandler._matchActionType(
        'eosio::issue',
        'eosio.token::*',
        { receiver: 'eosio.token', isNotification: false },
      )
      expect(match).toEqual(true)
      expect(dontMatch).toEqual(false)
    })

    it('matches on wildcarded contracts and actions', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        '*::*',
        { receiver: 'eosio.token', isNotification: false },
      )
      expect(match).toEqual(true)
    })

    it('matches on specific notified account', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue>myaccount',
        { receiver: 'myaccount', isNotification: true },
      )
      expect(match).toEqual(true)
    })

    it('matches on wildcard notified accounts', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue>*',
        { receiver: 'myaccount', isNotification: true },
      )
      expect(match).toEqual(true)
    })

    it('notification subscription does not match non-notification', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue>myaccount',
        { receiver: 'eosio.token', isNotification: false },
      )
      expect(match).toEqual(false)
    })

    it('non-notification subscription does not match notification', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue',
        { receiver: 'myaccount', isNotification: true },
      )
      expect(match).toEqual(false)
    })

    it('wildcard notification subscription does not match non-notification', () => {
      const match = actionHandler._matchActionType(
        'eosio.token::issue',
        'eosio.token::issue>*',
        { receiver: 'eosio.token', isNotification: false },
      )
      expect(match).toEqual(false)
    })
  })
})
