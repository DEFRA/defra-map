export const debounce = (fn, wait) => {
  let timeoutId = null
  return (...args) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      fn(...args)
    }, wait)
  }
}
