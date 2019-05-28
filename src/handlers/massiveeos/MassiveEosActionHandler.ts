import { HandlerVersion } from 'demux'
import { massive } from 'demux-postgres'
import { MassiveActionHandler, MigrationSequence } from 'demux-postgres'

export class MassiveEosActionHandler extends MassiveActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: massive.Database,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
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
  }
}
