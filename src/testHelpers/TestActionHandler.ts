import { MassiveEosActionHandler } from '../handlers/massiveeos/MassiveEosActionHandler'
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
  public _matchActionType(candidateType: string, subscribedType: string): boolean {
    return this.matchActionType(candidateType, subscribedType)
  }
}
