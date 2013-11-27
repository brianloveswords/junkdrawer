const entries = [].slice.call(document.querySelectorAll('li'))
const filter = document.getElementById('filter')

var oldTerm
filter.addEventListener('keyup', search)

function search() {
  const term = filter.value.trim()

  if (term == oldTerm) return

  if (!term)
    return showAll(entries)

  oldTerm = term

  console.log('doing')
  const pattern = new RegExp('.*?(' + term + ').*?', 'i')
  entries.forEach(function (entry) {
    const link = entry.querySelector('a')
    const filename = entry.dataset.file
    const match = pattern.exec(filename)
    if (pattern.test(filename)) {
      link.innerHTML =
        filename.replace(match[1], '<span>'+match[1]+'</span>')

      link.querySelector('span').classList.add('highlight')
      entry.classList.remove('hidden')
    }
    else {
      link.innerHTML = filename
      entry.classList.add('hidden')
    }
  })
}

function showAll(entries) {
  entries.forEach(function (entry) {
    const link = entry.querySelector('a')
    const filename = entry.dataset.file
    entries.forEach(function (entry) {
      link.innerHTML = filename
      entry.classList.remove('hidden')
    })
  })
}

search()
