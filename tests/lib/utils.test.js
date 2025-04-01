import { parseAttribute, isSame, getQueryParam, hasQueryParam, getImagePos, getColor } from '../../src/js/lib/utils'

describe('lib/utils - parseAttribute', () => {
  it('should parse correctly', () => {
    expect(parseAttribute('{ key: "test" }')).toEqual('{ key: "test" }')
  })

  it('should throw an error', () => {
    try {
      parseAttribute('test')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})

describe('lib/utils - isSame', () => {
  it('should pass correctly', () => {
    expect(isSame({ value: 'test' }, { value: 'test' })).toEqual(true)
  })
})

describe('lib/utils - getQueryParam', () => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { search: '?name=test' }
  })

  it('should pass correctly', () => {
    expect(getQueryParam('name')).toEqual('test')
  })
})

describe('lib/utils - hasQueryParam', () => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { search: '?name=test' }
  })

  it('should pass correctly', () => {
    expect(hasQueryParam('name')).toEqual(true)
  })
})
describe('lib/utils - getImagePos', () => {
  it('should getImagePos returns correct positions', () => {
    expect(getImagePos('default')).toBe('0 0')
    expect(getImagePos('dark')).toBe('0 -120px')
    expect(getImagePos('aerial')).toBe('0 -240px')
    expect(getImagePos('deuteranopia')).toBe('0 -360px')
    expect(getImagePos('tritanopia')).toBe('0 -480px')
    expect(getImagePos('invalid')).toBe(undefined)
  })
})

describe('lib/utils - getColor', () => {
  it('should handle different formats', () => {
    // Test null/undefined input
    expect(getColor(null, 'default')).toBe(null)
    expect(getColor(undefined, 'default')).toBe(null)

    // Test empty string - returns empty string, not null
    expect(getColor('', 'default')).toBe('')

    // Test single color
    expect(getColor('red', 'default')).toBe('red')

    // Test multiple colors with style
    expect(getColor('default:red,dark:blue', 'dark')).toBe('blue')

    // Test style not found (should return first color)
    expect(getColor('default:red,dark:blue', 'invalid')).toBe('red')

    // Test with spaces
    expect(getColor('default: red, dark: blue', 'dark')).toBe('blue')
  })
})
