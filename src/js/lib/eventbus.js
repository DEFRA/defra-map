const eventBus = {
  on (el, event, callback) {
    el.addEventListener(event, e => callback(e.detail))
  },
  dispatch (el, event, data) {
    el.dispatchEvent(new CustomEvent(event, { detail: data }))
    
    const div = document.createElement('div')
    div.setAttribute('style', 'position:absolute;top:100px;left:10px;border:2px solid green;z-index:1000;visibility:visible;background-color:white;')
    div.innerHTML = event
    document.body.appendChild(div)
    setTimeout(() => {
      document.body.removeChild(div)
    }, 1000)
  },
  remove (el, event, callback) {
    el.removeEventListener(event, callback)
  }
}

export default eventBus
