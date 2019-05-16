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
   * Matches wildcards in subscriptions for both the contract name and action type
   *
   * @param candidateType   The incoming action's type
   * @param subscribedType  The type the Updater of Effect is subscribed to
   */
  protected matchActionType(candidateType: string, subscribedType: string): boolean {
    const [ candidateContract, candidateAction ] = candidateType.split('::')
    const [ subscribedContract, subscribedAction ] = subscribedType.split('::')
    const contractsMatch = candidateContract === subscribedContract || subscribedContract === '*'
    const actionsMatch = candidateAction === subscribedAction || subscribedAction === '*'
    return contractsMatch && actionsMatch
  }
}
