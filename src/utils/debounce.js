// src/utils/debounce.js
export const debounce = (fn, wait) => {
  let timeoutId = null

  const debounced = (...args) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      fn(...args)
    }, wait)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}
