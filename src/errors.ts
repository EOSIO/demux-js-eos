// tslint:disable:max-classes-per-file
// Disabling tslint's max classes rule here because it would add a lot of unnecessary separation for simple classes.
export class RetrieveBlockError extends Error {
  constructor() {
    super('Error block, max retries failed')
    Object.setPrototypeOf(this, RetrieveBlockError.prototype)
  }
}

export class RetrieveHeadBlockError extends Error {
  constructor() {
    super('Error retrieving head block, max retries failed')
    Object.setPrototypeOf(this, RetrieveHeadBlockError.prototype)
  }
}

export class RetrieveIrreversibleBlockError extends Error {
  constructor() {
    super('Error retrieving last irreversible block, max retries failed')
    Object.setPrototypeOf(this, RetrieveIrreversibleBlockError.prototype)
  }
}

export class NoBlockStateFoundError extends Error {
  constructor(blockNumber: number) {
    super(`No block state with block number ${blockNumber} found`)
    Object.setPrototypeOf(this, NoBlockStateFoundError.prototype)
  }
}

export class MultipleBlockStateError extends Error {
  constructor(blockNumber: number) {
    super(`More than one block state returned for block number ${blockNumber}. ` +
          'Make sure you have the `--mongodb-update-via-block-num` flag set on your node.')
    Object.setPrototypeOf(this, MultipleBlockStateError.prototype)
  }
}
