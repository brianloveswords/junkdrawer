const list = document.querySelector('ul')
const entries = [].slice.call(document.querySelectorAll('li'))
const filter = document.getElementById('filter')

var oldTerm
filter.addEventListener('keyup', search)

var focused = -2

document.body.addEventListener('keydown', keystrokes, true)

function keystrokes(event) {
  // const up = 38
  // const down = 40

  // var visible = [].slice.call(document.querySelectorAll('li:not(.hidden)'))

  // if (!visible.length)
  //   return filter.focus()

  // if (event.keyCode == down) {
  //   focused ++

  //   if (focused == -1)
  //     return filter.focus()

  //   if (focused == visible.length)
  //     focused = visible.length - 1
  //   visible[focused].querySelector('a').focus()
  //   return false
  // }

  // else if (event.keyCode == up) {
  //   if (focused == -1)
  //     return

  //   focused --

  //   if (focused < 0) {
  //     list.querySelector('a:focus').blur()
  //     filter.focus()
  //     focused = -1
  //     return
  //   }
  //   visible[focused].querySelector('a').focus()
  //   return false
  // }

  // else {
  //   filter.focus()
  //   return true
  // }
}


function search(event) {
  const up = 38
  const down = 40

  if (event.keyCode == down || event.keyCode == up)
    return keystrokes(event)


  const term = filter.value.trim()

  if (term == oldTerm) return

  if (!term)
    return showAll(entries)

  oldTerm = term


  const pattern = new RegExp('.*?(' + term + ').*?', 'i')
  entries.forEach(function (entry) {
    const link = entry.querySelector('a')
    const filename = entry.dataset.file
    const match = pattern.exec(filename)
    if (pattern.test(filename)) {
      entry.classList.remove('hidden')

      const highlight = link.querySelector('span')

      function addHighlight() {
        clearTimeout(entry.timerAlpha)
        link.innerHTML =
          filename.replace(match[1], '<span>'+match[1]+'</span>')
        entry.timerAlpha = setTimeout(function () {
          link.querySelector('span').classList.add('highlight')
        }, 50)
      }

      if (highlight) {
        clearTimeout(entry.timerBeta)
        highlight.classList.remove('highlight')
        entry.timerBeta = setTimeout(addHighlight, 400)
      }

      else
        addHighlight()


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

search({})
