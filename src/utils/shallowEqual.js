export const shallowEqual = (a, b) =>
  a === b || (
    a && b &&
    typeof a === 'object' &&
    typeof b === 'object' &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every(k => Object.is(a[k], b[k]))
  )
