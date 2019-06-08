function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function retry<T>(func: () => Promise<T>, maxNumAttempts: number, waitMs: number): Promise<T> {
  let numAttempts = 1
  while (numAttempts <= maxNumAttempts) {
    try {
      return await func()
    } catch (err) {
      if (numAttempts - 1 === maxNumAttempts) {
        throw err
      }
    }
    numAttempts += 1
    await wait(waitMs)
  }
  throw new Error(`${maxNumAttempts} retries failed`)
}

export {
  retry
}
