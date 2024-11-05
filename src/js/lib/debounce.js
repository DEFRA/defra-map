export const debounce = (fn, wait) => {
  let timeoutId = null
  return (...args) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      console.log(...args)
      fn(...args)
    }, wait)
  }
}
