const fs = require('fs')
const path = require('path')
const concat = require('concat-stream')
const JunkDrawer = require('..')

const test = require('tap').test
const junkDir = path.join(__dirname, 'junk')
const junk = new JunkDrawer({ root: junkDir })

test('junkdrawer writes', function (t) {
  var writeStream
  t.plan(3)

  writeStream = junk.createWriteStream('some-trash.png')
  t.ok(writeStream, 'should have junkstream')

  writeStream = junk.createWriteStream('../some/bullshit')
  junk.once('unsafeWrite', function (error) {
    t.same(error.filename, '../some/bullshit')
  })
  writeStream.once('error', function (error) {
    t.same(error.name, 'UnsafeAccess')
  })
})

test('junkdrawer reads', function (t) {
  var readStream
  t.plan(3)

  readStream = junk.createReadStream('flan.jpg')
  t.ok(readStream, 'should have junkstream')

  readStream = junk.createReadStream('../some/bullshit')
  junk.once('unsafeRead', function (error) {
    t.same(error.filename, '../some/bullshit')
  })
  readStream.once('error', function (error) {
    t.same(error.name, 'UnsafeAccess')
  })
})

test('junkdrawer copy', function (t) {
  t.plan(3)

  junk.copyFile('flan.jpg', 'such-flan.jpg')
    .on('done', function () {
      t.same(read('flan.jpg'), read('such-flan.jpg'))
    })


  junk.copyFile('../../../flan.jpg', 'such-flan.jpg')
    .on('error', function (error) {
      t.same(error.name, 'UnsafeAccess')
    })

  junk.copyFile('flan.jpg', '../../../flan.jpg')
    .on('error', function (error) {
      t.same(error.name, 'UnsafeAccess')
    })

})

test('junkdrawer delete', function (t) {
  t.plan(3)

  junk.deleteFile('such-flan.jpg')
    .on('done', function () {
      t.notOk(exists('such-flan.jpg'), 'deleted')
    })

  junk.deleteFile('such-flan.jpg')
    .on('error', function (error) {
      t.same(error.code, 'ENOENT', 'does not exist')
    })

  junk.deleteFile('../such-flan.jpg')
    .on('error', function (error) {
      t.same(error.code, 'EUNSAFEACCESS', 'unsafe')
    })
})

test('junkdrawer move', function (t) {
  cp('flan.jpg', 'such-flan.jpg')

  junk.moveFile('such-flan.jpg', 'wow-flan.jpg')
    .on('done', function () {
      t.ok(exists('wow-flan.jpg'), 'should exist')
      t.notOk(exists('such-flan.jpg'), 'should not exist')
      unlink('wow-flan.jpg')
      t.end()
    })
})

test('junkdrawer file list', function (t) {
  junk.getFileList(function (err, files) {
    t.ok(files.length > 0, 'should have files')
    t.end()
  })
})


function cp(from, to) {
  const data = fs.readFileSync(path.join(junkDir, from))
  fs.writeFileSync(path.join(junkDir, to), data)
}

function exists(file) {
  return fs.existsSync(path.join(junkDir, file))
}

function unlink(file) {
  return fs.unlinkSync(path.join(junkDir, file))
}

function stream(file) {
  return fs.createReadStream(path.join(junkDir, file))
}

function read(file) {
  return fs.readFileSync(path.join(junkDir, file))
}
