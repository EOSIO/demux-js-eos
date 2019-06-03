import { actionTraces } from './actionTraces'
import { blockStates } from './blockStates'

const deepCloneBlockStates = (bStates: any) => {
  return JSON.parse(JSON.stringify(bStates))
}
// Do a reverse sort
const sortFunction = (a: any, b: any) => {
  return b.block_num - a.block_num
}

export const mockConnect = {
  db: (name: string) => {
    if (name === 'failed') {
      return {
        collections: () => ([
          { collectionName: 'block_states' },
          { collectionName: '1234' },
        ]),
      }
    } else {
      return {
        collection: (col: any) => {
          if (col === 'block_states') {
            return {
              find: (options: any) => ({
                limit: () => ({
                  sort: () => {
                    const newBlockStates = deepCloneBlockStates(blockStates)
                    newBlockStates.sort(sortFunction)
                    return {
                      toArray: () => [newBlockStates[0]],
                    }
                  },
                }),
                toArray: () => {
                  for (const bState of blockStates) {
                    if (bState.block_num === options.block_num) {
                      return [bState]
                    }
                  }
                  return []
                },
              }),
            }
          } else if (col === 'action_traces') {
            return ({
              find: () => ({
                sort: () => ({
                  toArray: () => actionTraces,
                }),
              }),
            })
          }
          return
        },
        collections: () => ([
          { collectionName: 'block_states' },
          { collectionName: 'action_traces' },
          { collectionName: 'testing' },
          { collectionName: '987123' },
        ]),
      }
    }
  },
}
