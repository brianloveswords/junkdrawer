const test = require('tape')
const safepath = require('../lib/safepath')

test('safepath', function (t) {
  t.ok(safepath('/yep', '/yep/totally'), 'safe')
  t.ok(safepath('/yep', '/yep/ya/../a/..'), 'safe')

  t.notOk(safepath('/yep', '/nope'), 'unsafe')
  t.notOk(safepath('yep', 'nope/../../../'), 'unsafe')
  t.end()
})
