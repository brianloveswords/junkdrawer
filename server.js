require('cleansocket/listen')
const http = require('http')
const path = require('path')

const drawerPath = process.env.DRAWER_PATH
const drawerRoot = path.resolve(__dirname, drawerPath)


const server = http.createServer()


// GET /some-path --> fs.createReadStream('drawer/some-path').pipe(res)
// DELETE /some-path --> fs.unlink('drawer/some-path', ...)
// POST /some-path --> req.pipe(fs.createWriteStream('/drawer/some-path'))
