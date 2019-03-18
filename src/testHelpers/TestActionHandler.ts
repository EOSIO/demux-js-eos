import { MassiveEosActionHandler } from '../handlers/massiveeos/MassiveEosActionHandler'

export class TestActionHandler extends MassiveEosActionHandler {
  public _matchActionType(candidateType: string, subscribedType: string): boolean {
    return this.matchActionType(candidateType, subscribedType)
  }
}
