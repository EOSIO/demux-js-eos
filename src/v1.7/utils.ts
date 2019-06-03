function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function retry(func: () => any, maxNumAttempts: number, waitMs: number): Promise<any> {
  let numAttempts = 1
  while (numAttempts <= maxNumAttempts) {
    try {
      return func()
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
