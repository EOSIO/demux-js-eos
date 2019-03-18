import { HandlerVersion } from 'demux'
import { MassiveActionHandler, MigrationSequence } from 'demux-postgres'

export class MassiveEosActionHandler extends MassiveActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: any,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
  }

  /**
   * By default, this method tests for direct equivalence between the incoming candidate type and the type that is
   * subscribed. Override this method to extend this functionality (e.g. wildcards).
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
