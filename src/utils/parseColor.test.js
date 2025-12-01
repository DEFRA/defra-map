import { parseColor } from './parseColor.js'

describe('parseColor', () => {
  // --- Case 1: colors is falsy
  it('returns null if colors is null or undefined', () => {
    expect(parseColor(null, 'anyStyle')).toBeNull()
    expect(parseColor(undefined, 'anyStyle')).toBeNull()
  })

  // --- Case 2: colors is a simple string
  it('returns the trimmed string color if colors is a string', () => {
    expect(parseColor('#fff', 'anyStyle')).toBe('#fff')
    expect(parseColor(' rgba(255,0,0,0.5) ', 'anyStyle')).toBe('rgba(255,0,0,0.5)')
  })

  // --- Case 3: colors is an object with mapStyleId matching
  it('returns the style-specific color if mapStyleId matches a key', () => {
    const colorMap = {
      dark: '#000',
      light: '#fff'
    }
    expect(parseColor(colorMap, 'dark')).toBe('#000')
    expect(parseColor(colorMap, 'light')).toBe('#fff')
  })

  // --- Case 4: colors is an object but mapStyleId does not match
  it('returns the first value in the object if mapStyleId does not match', () => {
    const colorMap = {
      dark: '#000',
      light: '#fff'
    }
    expect(parseColor(colorMap, 'unknown')).toBe('#000') // first value
  })

  // --- Case 5: colors is an empty object
  it('returns null if colors is an empty object', () => {
    expect(parseColor({}, 'dark')).toBeNull()
  })

  // --- Case 6: colors is an object but first value is falsy
  it('returns null if first value in object is undefined', () => {
    const colorMap = { dark: undefined }
    expect(parseColor(colorMap, 'light')).toBeNull()
  })

  // --- Case 7: mapStyleId not provided
  it('returns first value in object if mapStyleId is not provided', () => {
    const colorMap = { dark: '#000', light: '#fff' }
    expect(parseColor(colorMap)).toBe('#000')
  })

  // --- Case 8: fallback
  it('returns null for unsupported types to hit final return null', () => {
    expect(parseColor(42, 'anyStyle')).toBeNull() // number
    expect(parseColor(true, 'anyStyle')).toBeNull() // boolean
    expect(parseColor([], 'anyStyle')).toBeNull() // array
    expect(parseColor(() => {}, 'anyStyle')).toBeNull() // function
  })
})
