import { deepMerge } from './deepMerge'

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const base = { a: 1, b: 2 }
    const override = { b: 3, c: 4 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('merges nested objects', () => {
    const base = { a: 1, nested: { x: 10, y: 20 } }
    const override = { nested: { y: 30, z: 40 } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, nested: { x: 10, y: 30, z: 40 } })
  })

  it('overwrites arrays instead of merging', () => {
    const base = { arr: [1, 2, 3] }
    const override = { arr: [4, 5] }
    const result = deepMerge(base, override)
    expect(result).toEqual({ arr: [4, 5] })
  })

  it('overwrites primitives in nested objects', () => {
    const base = { a: { b: 1 } }
    const override = { a: 42 }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 42 })
  })

  it('handles null values correctly', () => {
    const base = { a: 1, b: { c: 2 } }
    const override = { b: null }
    const result = deepMerge(base, override)
    expect(result).toEqual({ a: 1, b: null })
  })

  it('does not mutate the base object', () => {
    const base = { a: 1, nested: { x: 10 } }
    const override = { nested: { y: 20 } }
    const result = deepMerge(base, override)
    expect(base).toEqual({ a: 1, nested: { x: 10 } }) // base unchanged
    expect(result).toEqual({ a: 1, nested: { x: 10, y: 20 } })
  })

  it('creates a new object for new keys', () => {
    const base = {}
    const override = { newKey: { inner: 'value' } }
    const result = deepMerge(base, override)
    expect(result).toEqual({ newKey: { inner: 'value' } })
  })
})
