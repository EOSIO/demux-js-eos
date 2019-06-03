const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const rmdir = promisify(fs.rmdir)
const unlink = promisify(fs.unlink)

const rmdirs = async (dir) => {
  let entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    let fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await rmdirs(fullPath)
    } else {
      await unlink(fullPath)
    }
  }
  return rmdir(dir)
}

(async () => {
  const buildItems = fs.readdirSync(process.cwd())
  for (const buildItem of buildItems) {
    if (buildItem.startsWith('index.')) {
      fs.unlinkSync(`${process.cwd()}/${buildItem}`)
    } else if (buildItem.match(/^v([0-9]+)+(\.[0-9]+)+(-[a-zA-Z0-9-_]+)?/g)) {
      await rmdirs(`${process.cwd()}/${buildItem}`)
    }
  }
})()
