const EventEmitter = require('events').EventEmitter
const fs = require('fs')
const safepath = require('./lib/safepath')
const util = require('util')
const xtend = require('xtend')

module.exports = JunkDrawer

function JunkDrawer(opts) {
  opts = opts || {}

  if (!(this instanceof JunkDrawer))
    return new JunkDrawer(opts)

  this._emit = EventEmitter.prototype.emit
  this.root = opts.root || '.'
  this.path = opts.path || 'junk'
}


JunkDrawer.prototype = xtend(EventEmitter.prototype, {
  emit: function () {
    const self = this
    const args = arguments
    global.setImmediate(function () {
      self._emit.apply(self, args)
    })
  },
  safe: function (filename) {
    return safepath(this.root, filename)
  },
  stream: function(type, filename) {
    const tr = {
      write: 'Write',
      read: 'Read'
    }

    if (!this.safe(filename)) {
      this.emit('unsafe'+tr[type], filename)
      return false
    }

    return fs['create'+tr[type]+'Stream'](this.safe(filename))
  },
  createWriteStream: function (filename) {
    return this.stream('write', filename)
  },
  createReadStream: function (filename) {
    return this.stream('read', filename)
  },

})
