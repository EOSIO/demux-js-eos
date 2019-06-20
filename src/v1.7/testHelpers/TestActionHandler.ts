import { MassiveEosActionHandler } from '../handlers/massiveeos'
import { HandlerVersion } from 'demux'

export class TestActionHandler extends MassiveEosActionHandler {
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
