import { MassiveEosActionHandler } from '../handlers/massiveeos'
import { HandlerVersion } from 'demux'
import { MigrationSequence } from 'demux-postgres'

export class TestActionHandler extends MassiveEosActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: any,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
  }
  public _matchActionType(candidateType: string, subscribedType: string, payload: any): boolean {
    return this.matchActionType(candidateType, subscribedType, payload)
  }
  public _validateHandlerVersions(handlerVersions: HandlerVersion[]) {
    return this.validateHandlerVersions(handlerVersions)
  }
  public _validateActionType(actionType: string) {
    return this.validateActionType(actionType)
  }
}
