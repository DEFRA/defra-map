import { stringToKebab } from './stringToKebab'

describe('stringToKebab', () => {
  it('converts camelCase to kebab-case', () => {
    expect(stringToKebab('camelCaseString')).toBe('camel-case-string')
    expect(stringToKebab('myTestValue')).toBe('my-test-value')
  })

  it('handles single word strings', () => {
    expect(stringToKebab('Test')).toBe('test')
    expect(stringToKebab('hello')).toBe('hello')
  })

  it('handles strings with numbers', () => {
    expect(stringToKebab('value1Test')).toBe('value1-test')
    expect(stringToKebab('Test123Value')).toBe('test123-value')
  })

  it('handles already kebab-case strings', () => {
    expect(stringToKebab('already-kebab')).toBe('already-kebab')
  })

  it('returns undefined for null or undefined input', () => {
    expect(stringToKebab(null)).toBeUndefined()
    expect(stringToKebab(undefined)).toBeUndefined()
  })

  it('handles empty string', () => {
    expect(stringToKebab('')).toBe('')
  })
})
