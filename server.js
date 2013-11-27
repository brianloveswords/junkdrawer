require('cleansocket/listen')

const http = require('http')
const path = require('path')
const url = require('url')
const JunkDrawer = require('./')

const drawerPath = process.env.DRAWER_PATH
const drawerRoot = path.resolve(__dirname, drawerPath)

const junkDrawer = new JunkDrawer({ root: drawerRoot })

const methodEndpoints = {
  'GET': function (req, res) {
    if (isIndex(req))
      return showIndex(res)

    const file = getFilePath(req)

    junkDrawer.createReadStream(file)
      .on('error', function (error) {
        console.dir(error)
        return fileNotFound(res)
      }).pipe(res)
  },

  'DELETE': function (req, res) {
    const file = getFilePath(req)

    junkDrawer.deleteFile(file)
      .on('error', function (error) {
        console.dir(error)
        return fileNotFound(res)
      })
      .on('done', function () {
        res.writeHead(200, {'content-type': 'text/plain'})
        res.write('yeah, fuck that file anyway')
        res.end()
      })
  },

  'POST': function (req, res) {
    const file = getFilePath(req)

    req.on('error', function () {
      return forbidden(res)
    })

    req.pipe(junkDrawer.createWriteStream(file))
      .on('error', function (error) {
        return forbidden(res)
      })
      .on('finish', function () {
        res.writeHead(200, {'content-type': 'text/plain'})
        res.write('got it')
        res.end()
      })
  }
}

http.createServer(function (req, res) {
  const method = req.method

  if (!acceptableMethod(method)) {
    res.writeHead(406)
    res.write('Method Not Allowed')
    return res.end()
  }

  return methodEndpoints[method](req, res)

}).listen('/tmp/junk.sock')

function isIndex(req) {
  const parts = url.parse(req.url)
  return parts.pathname.trim() === '/'
}

function showIndex(res) {
  junkDrawer.getFileList(function (error, files) {
    if (error) {
      console.dir(error)
      return fileNotFound(res)
    }

    res.writeHead(200, {'content-type': 'application/json'})
    res.write(JSON.stringify(files))
    res.end()
  })
}

function getFilePath(req) {
  const parts = url.parse(req.url)
  return unescape(parts.pathname).slice(1)
}

function acceptableMethod(method) {
  var METHODS = ['GET', 'POST', 'DELETE']
  return METHODS.indexOf(method) !== -1
}

function forbidden(res) {
  res.writeHead(403, {'content-type': 'text/plain'})
  res.write('fuck all that')
  res.end()
}

function fileNotFound(res) {
  res.writeHead(404, {'content-type': 'text/plain'})
  res.write('can\'t find shit')
  res.end()
}
