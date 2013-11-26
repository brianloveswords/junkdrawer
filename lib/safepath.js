const path = require('path')

// make sure a file path does not escape the root
module.exports = function safepath(root, testpath) {
  root = path.resolve(root)
  testpath = path.resolve(testpath)
  return testpath.indexOf(root) === 0
}
