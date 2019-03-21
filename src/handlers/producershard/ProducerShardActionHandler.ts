import { Effect, HandlerVersion, NextBlock } from 'demux'
import { MigrationSequence } from 'demux-postgres'
import { EosPayload } from '../../interfaces'
import { MassiveEosActionHandler } from '../massiveeos'

export class ProducerShardActionHandler extends MassiveEosActionHandler {
  constructor(
    protected handlerVersions: HandlerVersion[],
    protected massiveInstance: any,
    protected dbSchema: string = 'public',
    protected migrationSequences: MigrationSequence[] = [],
    protected configuredProducer: string,
  ) {
    super(handlerVersions, massiveInstance, dbSchema, migrationSequences)
  }

  protected runOrDeferEffect(effect: Effect, payload: EosPayload, nextBlock: NextBlock, context: any) {
    const producedBy = payload.producer
    const configuredProducer = this.configuredProducer

    if (producedBy === configuredProducer) {
      super.runOrDeferEffect(effect, payload, nextBlock, context)
    }
  }
}
