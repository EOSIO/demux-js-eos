import { HandlerVersion } from 'demux'
import { massive } from 'demux-postgres'
import { MassiveActionHandler, MigrationSequence } from 'demux-postgres'
import { EosPayload } from '../../interfaces'

export class MassiveEosActionHandler extends MassiveActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: massive.Database,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
    this.validateHandlerVersions(handlerVersions)
  }

  /**
   * Matches wildcards in subscriptions for both the contract name and action type.
   * Subscriptions to notifications (denoted with contract::action>notifiedAccount) are also handled.
   *
   * @param candidateType   The incoming action's type
   * @param subscribedType  The type the Updater of Effect is subscribed to
   * @param payload         The payload of the incoming Action
   */
  protected matchActionType(candidateType: string, subscribedType: string, payload: EosPayload): boolean {
    const [ candidateContract, candidateAction ] = candidateType.split('::')
    const [ subscribedContract, subscribedActionWithNotified ] = subscribedType.split('::')
    const [ subscribedAction, subscribedNotified ] = subscribedActionWithNotified.split('>')
    const contractsMatch = candidateContract === subscribedContract || subscribedContract === '*'
    const actionsMatch = candidateAction === subscribedAction || subscribedAction === '*'
    let notifiedMatch = false
    if (subscribedNotified === undefined && !payload.isNotification) {
      notifiedMatch = true
    } else if (subscribedNotified && subscribedNotified === payload.receiver) {
      notifiedMatch = true
    } else if (subscribedNotified === '*' && payload.isNotification) {
      notifiedMatch = true
    }
    return contractsMatch && actionsMatch && notifiedMatch
  }

  /**
   * Validates that all passed Updaters and Effects use valid, expected syntax for their action types.
   *
   * @param handlerVersions  The handlerVersions passed to the constructor
   */
  protected validateHandlerVersions(handlerVersions: HandlerVersion[]) {
    const badActionTypes = new Set()
    for (const handlerVersion of handlerVersions) {
      const updatersAndEffects = [ ...handlerVersion.updaters, ...handlerVersion.effects ]
      for (const subscription of updatersAndEffects) {
        if (!this.validateActionType(subscription.actionType)) {
          badActionTypes.add(subscription.actionType)
        }
      }
    }
    if (badActionTypes.size) {
      const badActionTypesString = Array.from(badActionTypes).join(', ')
      throw Error(`The following action types are not valid for EOS subscriptions: ${badActionTypesString}`)
    }
  }

  /**
   * Validates that a given action type uses expected syntax
   *
   * @param actionType
   */
  protected validateActionType(actionType: string) {
    const validationRegex = /^([a-z12345]{1,12}|\*)::([a-z12345]{1,12}|\*)(>([a-z12345]{1,12}|\*))?$/g
    return !!actionType.match(validationRegex)
  }
}
