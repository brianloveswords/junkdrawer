const entries = [].slice.call(document.querySelectorAll('li'))
const filter = document.getElementById('filter')

var oldTerm
setInterval(function () {

  const term = filter.value
  if (term == oldTerm) return
  oldTerm = term

  console.log('doing')
  const pattern = new RegExp('.*?' + term + '.*?', 'i')
  entries.forEach(function (entry) {
    const filename = entry.dataset.file
    if (!term || pattern.test(filename))
      entry.classList.remove('hidden')
    else
      entry.classList.add('hidden')
  })
}, 300)
