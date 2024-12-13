const eventBus = {
  on (el, event, callback) {
    el.addEventListener(event, e => callback(e.detail))
  },
  dispatch (el, event, data) {
    el.dispatchEvent(new CustomEvent(event, { detail: data }))
  },
  remove (el, event, callback) {
    el.removeEventListener(event, callback)
  }
}

export default eventBus
