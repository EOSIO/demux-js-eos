const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const rmdir = promisify(fs.rmdir)
const unlink = promisify(fs.unlink)

const rmdirs = async (dir) => {
    console.log("  dir:", dir)
  let entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    console.log("  entry:", entry)
    let fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      console.log("recursing:", fullPath)
      await rmdirs(fullPath)
    } else {
      console.log("unlinking:", fullPath)
      await unlink(fullPath)
    }
  }
  return rmdir(dir)
}

(async () => {
  const buildItems = await readdir(process.cwd(), { withFileTypes: true })
  for (const buildItem of buildItems) {
    const fullPath = path.join(process.cwd(), buildItem.name)
    if (buildItem.name.startsWith('index.')) {
      await unlink(fullPath)
    } else if (buildItem.name.match(/^v([0-9]+)+(\.[0-9]+)+(-[a-zA-Z0-9-_]+)?/g)) {
      // Matches 'v' followed by digits separated by dots followed by an optional '-tag'
      await rmdirs(fullPath)
    }
  }
})()
