require('cleansocket/listen')

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const mime = require('mime')
const humanize = require('humanize')
const JunkDrawer = require('./')
const Handlebars = require('handlebars')
const Ecstatic = require('ecstatic')

const drawerPath = process.env.JUNKPATH
const drawerRoot = path.resolve(__dirname, drawerPath)

const staticDir = path.join(__dirname, 'static')
const staticPath = '/static/'

const junkDrawer = JunkDrawer({ root: drawerRoot })
const ecstatic = Ecstatic({
  baseDir: staticPath,
  root: staticDir,
})

Handlebars.registerHelper('human', function(num) {
  return humanize.filesize(num)
})


const methodEndpoints = {
  'HEAD': function (req, res) {
    const file = getFilePath(req)

    var size = 0

    const type = mime.lookup(file)
    res.setHeader('content-type', type)

    junkDrawer.createReadStream(file)
      .on('error', function (error) {
        console.dir(error)
        return fileNotFound(res)
      })
      .on('data', function (data) { size += data.length })
      .on('end', function () {
        res.writeHead(200, {
          'x-human-size': humanize.filesize(size)
        })
        res.end()
      })
  },

  'GET': function (req, res) {
    if (isIndex(req))
      return showIndex(res)

    if (isStatic(req))
      return ecstatic(req, res)

    const file = getFilePath(req)
    const type = mime.lookup(file)

    res.setHeader('content-type', type)
    res.setHeader('access-control-allow-origin', '*')
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

    req.on('error', function (error) {
      console.dir(error)
      return forbidden(res)
    })

    req.pipe(junkDrawer.createWriteStream(file))
      .on('error', function (error) {
        console.dir(error)
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

}).listen(process.env.SOCKET || process.env.PORT || '/tmp/junk.sock')

function isIndex(req) {
  const parts = url.parse(req.url)
  return parts.pathname.trim() === '/'
}

function isStatic(req) {
  const parts = url.parse(req.url)
  const fullpath = parts.pathname
  return fullpath.indexOf(path.join(staticPath, '/')) === 0
}

function showIndex(res) {
  const templateFile = path.join(__dirname, 'index.html')
  fs.readFile(templateFile, function (error, contents) {
    if (error) {
      console.dir(error)
      return fileNotFound(res)
    }

    const tmpl = Handlebars.compile(contents.toString('utf8'))
    junkDrawer.getFileList(function (error, files) {
      if (error) {
        console.dir(error)
        return fileNotFound(res)
      }

      res.writeHead(200, {'content-type': 'text/html'})
      res.write(tmpl({ files: files }))
      res.end()
    })
  })
}

function getFilePath(req) {
  const parts = url.parse(req.url)
  return unescape(parts.pathname).slice(1)
}

function acceptableMethod(method) {
  var METHODS = ['GET', 'POST', 'DELETE', 'HEAD']
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
