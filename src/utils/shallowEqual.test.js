import { shallowEqual } from './shallowEqual'

describe('shallowEqual', () => {
  it('returns true for the same primitive values', () => {
    expect(shallowEqual(5, 5)).toBe(true)
    expect(shallowEqual('foo', 'foo')).toBe(true)
    expect(shallowEqual(null, null)).toBe(true)
    expect(shallowEqual(undefined, undefined)).toBe(true)
  })

  it('returns false for different primitive values', () => {
    expect(shallowEqual(5, 6)).toBe(false)
    expect(shallowEqual('foo', 'bar')).toBe(false)
    expect(shallowEqual(null, undefined)).toBe(false)
  })

  it('returns true for shallowly equal objects', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 2 }
    expect(shallowEqual(obj1, obj2)).toBe(true)
  })

  it('returns false for objects with different keys', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, c: 2 }
    expect(shallowEqual(obj1, obj2)).toBe(false)
  })

  it('returns false for objects with same keys but different values', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 3 }
    expect(shallowEqual(obj1, obj2)).toBe(false)
  })

  it('returns true for objects with same reference', () => {
    const obj = { a: 1 }
    expect(shallowEqual(obj, obj)).toBe(true)
  })

  it('returns true for shallowly equal arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 3]
    expect(shallowEqual(arr1, arr2)).toBe(true)
  })

  it('returns false for arrays with different elements', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1, 2, 4]
    expect(shallowEqual(arr1, arr2)).toBe(false)
  })

  it('returns false when one argument is not an object', () => {
    const obj = { a: 1 }
    expect(shallowEqual(obj, 5)).toBe(false)
    expect(shallowEqual(5, obj)).toBe(false)
  })

  it('returns false when one argument is null and the other is object', () => {
    expect(shallowEqual(null, {})).toBe(false)
    expect(shallowEqual({}, null)).toBe(false)
  })

  it('returns false for objects with different number of keys', () => {
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1 }
    expect(shallowEqual(obj1, obj2)).toBe(false)
    expect(shallowEqual(obj2, obj1)).toBe(false)
  })
})
