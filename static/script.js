const list = document.querySelector('ul')
const entries = [].slice.call(document.querySelectorAll('li'))
const filter = document.getElementById('filter')

var oldTerm
filter.addEventListener('keyup', search)

var focused = -2

document.body.addEventListener('keydown', function (event) {
  const up = 38
  const down = 40

  if (event.keyCode == down) {
    focused ++

    if (focused == -1)
      return filter.focus()

    if (focused == entries.length)
      focused = entries.length - 1
    entries[focused].querySelector('a').focus()
  }

  if (event.keyCode == up) {
    if (focused == -1)
      return

    focused --

    if (focused < 0) {
      list.querySelector('a:focus').blur()
      filter.focus()
      focused = -1
      return
    }
    entries[focused].querySelector('a').focus()
  }
})


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
