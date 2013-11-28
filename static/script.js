/*!
* domready (c) Dustin Diaz 2012 - License MIT
*/
!function(e,t){typeof module!="undefined"?module.exports=t():typeof define=="function"&&typeof define.amd=="object"?define(t):this[e]=t()}("domready",function(e){function p(e){h=1;while(e=t.shift())e()}var t=[],n,r=!1,i=document,s=i.documentElement,o=s.doScroll,u="DOMContentLoaded",a="addEventListener",f="onreadystatechange",l="readyState",c=o?/^loaded|^c/:/^loaded|c/,h=c.test(i[l]);return i[a]&&i[a](u,n=function(){i.removeEventListener(u,n,r),p()},r),o&&i.attachEvent(f,n=function(){/^c/.test(i[l])&&(i.detachEvent(f,n),p())}),e=o?function(n){self!=top?h?n():t.push(n):function(){try{s.doScroll("left")}catch(t){return setTimeout(function(){e(n)},50)}n()}()}:function(e){h?e():t.push(e)}})

window.domready(function () {
  var entries = [].slice.call(document.querySelectorAll('li'))
  const list = document.querySelector('ul')
  const filter = document.getElementById('filter')

  const cache = list.innerHTML

  filter.addEventListener('keyup', search)

  var oldTerm
  function search(event) {
    const term = filter.value.trim()
    if (term == oldTerm) return
    if (!term && oldTerm)
      return showAll(entries)
    oldTerm = term
    const pattern = new RegExp('.*?(' + term + ').*?', 'i')
    entries.forEach(function (entry) {
      const link = entry.querySelector('a')
      const filename = entry.dataset.file
      const match = pattern.exec(filename)

      if (pattern.test(filename)) {
        const highlight = link.querySelector('span')

        entry.classList.remove('hidden')

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

  function showAll() {
    list.innerHTML = cache
    entries = [].slice.call(document.querySelectorAll('li'))
  }

  search({})
})
