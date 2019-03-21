import { Effect, NextBlock } from 'demux'
import { ProducerShardActionHandler } from '../handlers/producershard'
import { EosPayload } from '../interfaces'

export class TestProducerShardActionHandler extends ProducerShardActionHandler {
  public _runOrDeferEffect(effect: Effect, payload: EosPayload, nextBlock: NextBlock, context: any) {
    this.runOrDeferEffect(effect, payload, nextBlock, context)
  }
}
