const path = require('path')

// make sure a file path does not escape the root
module.exports = function safepath(root, testpath) {
  root = path.resolve(root)
  testpath = path.resolve(testpath)
  if (testpath.indexOf(root) === 0)
    return testpath
  return false
}
