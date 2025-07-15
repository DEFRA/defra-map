export const throttle = (fn, wait) => {
  let lastCallTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastCallTime >= wait) {
      lastCallTime = now
      fn(...args)
    }
  }
}
