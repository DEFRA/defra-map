export const shallowEqual = (a, b) => {
  // Same reference or primitive equality
  if (a === b) {
    return true
  }

  // If either is null or not an object, they are not equal
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  // Different number of keys → not equal
  if (keysA.length !== keysB.length) {
    return false
  }

  // Compare each key using Object.is
  return keysA.every(k => Object.is(a[k], b[k]))
}
