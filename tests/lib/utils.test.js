import { parseAttribute, isSame, getQueryParam, hasQueryParam } from '../../src/js/lib/utils'

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
