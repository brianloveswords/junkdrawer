const entries = [].slice.call(document.querySelectorAll('li'))


const filter = document.getElementById('filter')

filter.addEventListener('keyup', function (evt) {
  const term = this.value
  const pattern = new RegExp('.*?' + this.value + '.*?')
  entries.forEach(function (entry) {
    const filename = entry.dataset.file
    if (!pattern.test(filename))
      entry.classList.add('hidden')
    else
      entry.classList.remove('hidden')
  })
})
