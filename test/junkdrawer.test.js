const path = require('path')
const fs = require('fs')
const JunkDrawer = require('..')

const test = require('tap').test
const junk = new JunkDrawer({ path: 'junk' })

test('junkdrawer writes', function (t) {
  const writeStream = junk.createWriteStream('some-trash.png')
  t.ok(writeStream, 'should have junkstream')

  t.notOk(junk.createWriteStream('../some/bullshit'), 'no sstream')
  junk.once('unsafeWrite', function (filename) {
    t.same(filename, '../some/bullshit')
  })

  t.end()
})

test('junkdrawer reads', function (t) {
  const readStream = junk.createReadStream('dope.png')
  t.ok(readStream, 'should have junkstream')

  t.notOk(junk.createReadStream('../some/bullshit'), 'no sstream')
  junk.once('unsafeRead', function (filename) {
    t.same(filename, '../some/bullshit')
  })

  t.end()
})

function stream(file) {
  return fs.createReadStream(path.join(__dirname, 'data', file))
}
