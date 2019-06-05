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
  console.log("process.cwd():", process.cwd())
  const buildItems = fs.readdirSync(process.cwd())
  for (const buildItem of buildItems) {
    if (buildItem.startsWith('index.')) {
      fs.unlinkSync(`${process.cwd()}/${buildItem}`)
    } else if (buildItem.match(/^v([0-9]+)+(\.[0-9]+)+(-[a-zA-Z0-9-_]+)?/g)) {
      // Matches 'v' followed by digits separated by dots followed by an optional '-tag'
      await rmdirs(`${process.cwd()}/${buildItem}`)
    }
  }
})()
