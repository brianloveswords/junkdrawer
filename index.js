const path = require('path')
const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const safepath = require('./lib/safepath')
const util = require('util')
const xtend = require('xtend')
const through = require('through')

module.exports = JunkDrawer

function JunkDrawer(opts) {
  opts = opts || {}

  if (!(this instanceof JunkDrawer))
    return new JunkDrawer(opts)

  defer(this, 'emit')
  this.root = opts.root || '.'
}

JunkDrawer.prototype = xtend(EventEmitter.prototype, {
  doneEmitter: function (callback) {
    const ee = new EventEmitter()
    if (callback) {
      ee.on('error', callback)
      ee.on('done', callback)
    }
    defer(ee, 'emit')
    return ee
  },

  safe: function (file) {
    return safepath(this.root, file)
  },

  createStream: function(type, file) {
    const stream = through()
    const safename = this.safe(file)
    defer(stream, 'emit')

    if (!safename)
      return this.unsafeAccessError(type, file, stream)

    this.emit('begin' + type)
    const readOrWrite = 'create' + type + 'Stream'
    return fs[readOrWrite](safename)
  },
  createWriteStream: function (file) {
    return this.createStream('Write', file)
  },
  createReadStream: function (file) {
    return this.createStream('Read', file)
  },
  copyFile: function (from, to, callback) {
    const event = this.doneEmitter(callback)

    const safefrom = this.safe(from)
    const safeto = this.safe(to)
    if (!safefrom) return this.unsafeAccessError('Copy', from, event)
    if (!safeto) return this.unsafeAccessError('Copy', to, event)

    this.createReadStream(from)
      .on('error', function (error) { event.emit('error', error) })
      .pipe(this.createWriteStream(to))
      .on('error', function (error) { event.emit('error', error) })
      .on('finish', function () { event.emit('done') })

    return event
  },
  deleteFile: function (file, callback) {
    const event = this.doneEmitter(callback)
    const safename = this.safe(file)

    if (!safename)
      return this.unsafeAccessError('Delete', file, event)

    fs.unlink(safename, function (error) {
      if (error)
        return event.emit('error', error)
      return event.emit('done')
    })

    return event
  },
  moveFile: function (from, to, callback) {
    const self = this
    const event = self.doneEmitter(callback)
    const safefrom = self.safe(from)
    const safeto = self.safe(to)

    if (!safefrom) return self.unsafeAccessError('Move', from, event)
    if (!safeto) return self.unsafeAccessError('Move', to, event)

    self.copyFile(safefrom, safeto, function (error) {
      if (error) return event.emit('error', error)

      self.deleteFile(safefrom, function (error) {
        if (error) return event.emit('error', error)
        return event.emit('done')
      })
    })

    return event
  },
  unsafeAccessError: function (type, file, emitter) {
    const error = unsafeAccessError(this.root, file)
    this.emit('unsafe' + type, error)
    emitter.emit('error', error)
    return emitter
  }

})

function defer(obj, method) {
  const orig = obj[method]
  obj[method] = function () {
    const args = arguments
    global.setImmediate(function () {
      orig.apply(obj, args)
    })
  }
}

function unsafeAccessError(root, filename) {
  const resolved = path.resolve(root, filename)
  const error = new Error('outside of junk drawer, ' + resolved)
  error.name = 'UnsafeAccess'
  error.code = 'EUNSAFEACCESS'
  error.root = root
  error.path = resolved
  error.filename = filename
  error.stack = fixStack(error.stack)
  return error
}

function fixStack(stack) {
  const lines = stack.split('\n')
  const first = lines[0]
  return [first].concat(lines.slice(2)).join('\n')
}
