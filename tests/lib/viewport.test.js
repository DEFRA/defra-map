import { getFocusPadding, getFocusBounds, getMapPixel, getDescription, getStatus, getPlace, parseCentre, parseZoom, getShortcutKey, spatialNavigate, getFeatureShape, getScale, getPoint, getStyle } from '../../src/js/lib/viewport'
import { defaults } from '../../src/js/store/constants'

const mockElement = (boundingRect, closestMock = null) => {
  return {
    getBoundingClientRect: () => boundingRect,
    closest: jest.fn(() => closestMock)
  }
}

describe('lib/viewport - getFocusPadding', () => {
  it('should calculate correct padding values', () => {
    const parentRect = { x: 10, y: 20, left: 10, top: 20, width: 200, height: 150 }
    const elementRect = { x: 30, y: 50, left: 30, top: 50, width: 50, height: 50 }
    const parentMock = mockElement(parentRect)
    const elementMock = mockElement(elementRect, parentMock)
    document.body.getBoundingClientRect = () => parentRect
    const scale = 1
    const padding = getFocusPadding(elementMock, scale)
    expect(padding).toEqual({ top: 30, left: 20, right: 130, bottom: 70 })
  })

  it('should return false if any padding is negative', () => {
    const parentRect = { x: 50, y: 50, left: 50, top: 50, width: 100, height: 100 }
    const elementRect = { x: 40, y: 40, left: 40, top: 40, width: 50, height: 50 }
    const parentMock = mockElement(parentRect)
    const elementMock = mockElement(elementRect, parentMock)
    document.body.getBoundingClientRect = () => parentRect
    expect(getFocusPadding(elementMock, 1)).toBe(false)
  })
})

describe('lib/viewport - getFocusBounds', () => {
  it('should calculate correct bounds values', () => {
    const parentRect = { x: 10, y: 20, left: 10, top: 20, width: 200, height: 150 }
    const elementRect = { x: 30, y: 50, left: 30, top: 50, width: 50, height: 50 }
    const parentMock = mockElement(parentRect)
    const elementMock = mockElement(elementRect, parentMock)
    document.body.getBoundingClientRect = () => parentRect
    const scale = 1
    const bounds = getFocusBounds(elementMock, scale)
    expect(bounds).toEqual([[30, 70], [60, 40]])
  })
})

describe('lib/viewport - getMapPixel', () => {
  it('should calculate correct map pixel position', () => {
    const parentRect = { x: 10, y: 20, left: 10, top: 20, width: 200, height: 150 }
    const elementRect = { x: 30, y: 50, left: 30, top: 50, width: 50, height: 50 }
    const parentMock = mockElement(parentRect)
    const elementMock = mockElement(elementRect, parentMock)
    document.body.getBoundingClientRect = () => parentRect
    const scale = 1
    const point = getMapPixel(elementMock, scale)
    expect(point).toEqual([45, 55])
  })
})

describe('lib/viewport - getDescription', () => {
  it('should return correct description for featuresTotal', () => {
    const description = getDescription('Test Place', [-2.989707, 54.864555], [1, 1, 1, 1], { featuresTotal: 5 })
    expect(description).toContain('5 features in this area')
  })

  it('should return correct description for isPixelFeaturesAtPixel', () => {
    const description = getDescription(null, [-2.989707, 54.864555], [1, 1, 1, 1], { isPixelFeaturesAtPixel: true })
    expect(description).toContain('Data visible at the center coordinate')
  })

  it('should return correct description for isPixelFeaturesInMap', () => {
    const description = getDescription(null, [-2.989707, 54.864555], [1, 1, 1, 1], { isPixelFeaturesInMap: true })
    expect(description).toContain('No data visible at the center coordinate')
  })

  it('should return correct description for isFeaturesInMap', () => {
    const description = getDescription(null, [-2.989707, 54.864555], [1, 1, 1, 1], { isFeaturesInMap: true })
    expect(description).toContain('No feature data in this area')
  })

  it('should format coordinate correctly for lat long', () => {
    const description = getDescription(null, [-2.989707, 54.864555], [-2.989707, 54.864555, -2.878635, 54.937635], {})
    expect(description).toContain('Focus area approximate center lat 54.8646 long -2.9897. Covering 4 miles by 5 miles.')
  })

  it('should format format coordinate correctly for eastings and northings', () => {
    const description = getDescription(null, [324973, 536891], [338388, 554644, 340881, 557137], {})
    expect(description).toContain('Focus area approximate center easting 324973 long 536891. Covering 1.5 miles by 1.5 miles.')
  })
})

describe('lib/viewport - getStatus', () => {
  let current
  let state

  beforeEach(() => {
    current = {
      center: [0, 0],
      bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
      zoom: 10,
      features: { featuresInViewport: [] },
      label: null,
      selectedId: null
    }
    state = { center: [1, 1], zoom: 9 }
  })

  it('should return label if present', () => {
    current.label = 'Test Label'
    expect(getStatus('ANY', false, null, state, current)).toBe('Test Label')
  })

  it('should return selected status if selectedId is present', () => {
    current.selectedId = '123'
    expect(getStatus('ANY', false, null, state, current)).not.toBeNull()
  })

  it('should return \'Map change\' message when action is \'DATA\'', () => {
    expect(getStatus('DATA', false, null, state, current)).toBe(
      'Map change: new data. Use ALT plus I to get new details'
    )
  })

  it('should return description when isPanZoom is true or action is \'GEOLOC\'', () => {
    expect(getStatus('ANY', true, 'Place', state, current)).not.toBeNull()
    expect(getStatus('GEOLOC', false, null, state, current)).not.toBeNull()
  })

  it('returns an empty string for other cases', () => {
    expect(getStatus('OTHER', false, null, state, current)).toBe('')
  })
})

describe('lib/viewport - getPlace', () => {
  it('should return undefined if isUserInitiated is true', () => {
    expect(getPlace(true, 'RESET', 'Old Place', 'New Place')).toBeUndefined()
  })

  it('should return oPlace if action is RESET and isUserInitiated is false', () => {
    expect(getPlace(false, 'RESET', 'Old Place', 'New Place')).toBe('Old Place')
  })

  it('should return newPlace if action is not RESET and isUserInitiated is false', () => {
    expect(getPlace(false, 'UPDATE', 'Old Place', 'New Place')).toBe('New Place')
  })

  it('should return undefined if isUserInitiated is false and newPlace is undefined', () => {
    expect(getPlace(false, 'UPDATE', 'Old Place', undefined)).toBeUndefined()
  })
})

describe('lib/viewport - parseCentre', () => {
  it('should return null if value is not in correct format', () => {
    expect(parseCentre('10,20', '27700')).toBeNull()
  })

  it('should return null if coords are not numbers', () => {
    expect(parseCentre('10,abc,20', '27700')).toBeNull()
  })

  it('should return coords if within bounds for srid 27700', () => {
    expect(parseCentre('324973,536891,0', '27700')).toEqual([324973, 536891])
  })

  it('should return null if coords are out of bounds for srid 4326', () => {
    expect(parseCentre('324973,536891,0', '4326')).toBeNull()
  })

  it('should return coords if within bounds for srid 4326', () => {
    expect(parseCentre('-2.94,54.89,0', '4326')).toEqual([-2.94, 54.89])
  })
})

describe('lib/viewport - parseZoom', () => {
  it('should return zoom level when input is valid', () => {
    expect(parseZoom('12.34,56.78,8')).toBe(8)
    expect(parseZoom('0,0,5.5')).toBe(5.5)
  })

  it('should return null for invalid inputs', () => {
    expect(parseZoom(null)).toBeNull()
    expect(parseZoom(undefined)).toBeNull()
    expect(parseZoom('')).toBeNull()
    expect(parseZoom('12.34,56.78')).toBeNull()
  })
})

describe('lib/viewport - getShortcutKey', () => {
  it('should return the correct feature ID based on the event code', () => {
    const featuresViewport = [
      { id: 'feature1' },
      { id: 'feature2' },
      { id: 'feature3' }
    ]
    expect(getShortcutKey({ code: 'Digit1' }, featuresViewport)).toBe('feature1')
    expect(getShortcutKey({ code: 'Digit2' }, featuresViewport)).toBe('feature2')
    expect(getShortcutKey({ code: 'Digit3' }, featuresViewport)).toBe('feature3')
  })

  it('should return an empty string when the index is out of bounds', () => {
    const featuresViewport = [{ id: 'feature1' }]
    expect(getShortcutKey({ code: 'Digit2' }, featuresViewport)).toBe('')
    expect(getShortcutKey({ code: 'Digit5' }, featuresViewport)).toBe('')
  })

  it('should return an empty string when featuresViewport is empty', () => {
    expect(getShortcutKey({ code: 'Digit1' }, [])).toBe('')
  })
})

describe('lib/viewport - spatialNavigate', () => {
  const pixels = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ]

  it('should navigate up correctly', () => {
    expect(spatialNavigate('up', [1, 1], pixels)).toBe(1) // Moves to [1, 0]
  })

  it('should navigate down correctly', () => {
    expect(spatialNavigate('down', [1, 1], pixels)).toBe(7) // Moves to [1, 2]
  })

  it('should navigate left correctly', () => {
    expect(spatialNavigate('left', [1, 1], pixels)).toBe(3) // Moves to [0, 1]
  })

  it('should navigate right correctly', () => {
    expect(spatialNavigate('right', [1, 1], pixels)).toBe(5) // Moves to [2, 1]
  })

  it('should return the same index when no valid move is possible', () => {
    expect(spatialNavigate('up', [0, 0], pixels)).toBe(0)
    expect(spatialNavigate('left', [0, 0], pixels)).toBe(0)
    expect(spatialNavigate('down', [2, 2], pixels)).toBe(8)
    expect(spatialNavigate('right', [2, 2], pixels)).toBe(8)
  })
})

describe('lib/viewport - getFeatureShape', () => {
  it('should return \'square\' for a square feature', () => {
    const squareFeature = { geometry: { coordinates: [[[2, 1], [6, 1], [6, 5], [2, 5], [2, 1]]] } }
    expect(getFeatureShape(squareFeature)).toBe('square')
  })

  it('should return \'polygon\' for a non-square feature', () => {
    const nonSquareFeature = { geometry: { coordinates: [[[0, 0], [0, 2], [1, 1], [1, 0], [0, 0]]] } }
    expect(getFeatureShape(nonSquareFeature)).toBe('polygon')
  })

  it('should return \'null\' for an empty feature', () => {
    const emptyFeature = null
    expect(getFeatureShape(emptyFeature)).toBe(null)
  })
})

describe('lib/viewport - getScale', () => {
  it('should return correct scale for small', () => {
    expect(getScale('small')).toBe(1)
  })

  it('should return correct scale for medium', () => {
    expect(getScale('medium')).toBe(1.5)
  })

  it('should return correct scale for large', () => {
    expect(getScale('large')).toBe(2)
  })

  it('should return default scale for unknown size', () => {
    expect(getScale('extra-large')).toBe(1)
  })
})

describe('lib/viewport - getPoint', () => {
  test('correctly calculates point coordinates', () => {
    const mockElement = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 50,
        top: 100
      })
    }

    const mockEvent = {
      nativeEvent: {
        clientX: 150,
        clientY: 250
      }
    }

    const scale = 2

    // Expected result
    const expectedPoint = [50, 75]
    const result = getPoint(mockElement, mockEvent, scale)
    expect(result).toEqual(expectedPoint)
  })

  it('should handle different scale values', () => {
    const mockElement = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 10,
        top: 20
      })
    }

    const mockEvent = {
      nativeEvent: {
        clientX: 110,
        clientY: 120
      }
    }
    expect(getPoint(mockElement, mockEvent, 1)).toEqual([100, 100])
    expect(getPoint(mockElement, mockEvent, 1.5)).toEqual([66.66666666666667, 66.66666666666667])
    expect(getPoint(mockElement, mockEvent, 2)).toEqual([50, 50])
  })
})

describe('lib/viewport - getStyle', () => {
  // Mock localStorage
  let localStorageMock

  beforeEach(() => {
    // Setup localStorage mock before each test
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    }

    // Replace the global localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  it('should return style from localStorage when it exists and is valid', () => {
    // Use styles that match entries in defaults.STYLES
    const styles = [
      { name: defaults.STYLES[0], color: '#FFFFFF' },
      { name: defaults.STYLES[1], color: '#000000' },
      { name: defaults.STYLES[2], color: '#EEEEEE' }
    ]

    // Set localStorage to return the second style
    localStorageMock.getItem.mockReturnValue(defaults.STYLES[1])

    // Call the function
    const result = getStyle(styles)

    // Assert result is the requested style
    expect(result).toEqual({ name: defaults.STYLES[1], color: '#000000' })
    expect(localStorageMock.getItem).toHaveBeenCalledWith('style')
  })

  it('should return default style when localStorage value is not in provided styles', () => {
    // Use styles that match entries in defaults.STYLES
    const styles = [
      { name: defaults.STYLES[0], color: '#FFFFFF' }, // Assuming this is 'default'
      { name: defaults.STYLES[1], color: '#000000' }
    ]

    // Set localStorage to return a value not in styles
    localStorageMock.getItem.mockReturnValue('not-in-styles')

    // Call the function
    const result = getStyle(styles)

    // Assert result is the default style
    expect(result).toEqual({ name: defaults.STYLES[0], color: '#FFFFFF' })
  })

  it('should return default style when localStorage is empty', () => {
    // Use styles that match entries in defaults.STYLES
    const styles = [
      { name: defaults.STYLES[0], color: '#FFFFFF' }, // Assuming this is 'default'
      { name: defaults.STYLES[1], color: '#000000' }
    ]

    // Set localStorage to return null (empty)
    localStorageMock.getItem.mockReturnValue(null)

    // Call the function
    const result = getStyle(styles)

    // Assert result is the default style
    expect(result).toEqual({ name: defaults.STYLES[0], color: '#FFFFFF' })
  })

  it('should filter out invalid styles not included in defaults.STYLES', () => {
    // Use some valid styles and one invalid style
    const styles = [
      { name: defaults.STYLES[0], color: '#FFFFFF' }, // Assuming this is 'default'
      { name: defaults.STYLES[1], color: '#000000' },
      { name: 'invalid-style', color: '#FF0000' } // This style is not in defaults.STYLES
    ]

    // Set localStorage to return the invalid style
    localStorageMock.getItem.mockReturnValue('invalid-style')

    // Call the function
    const result = getStyle(styles)

    // Assert result is the default style since 'invalid-style' should be filtered out
    expect(result).toEqual({ name: defaults.STYLES[0], color: '#FFFFFF' })
  })

  it('should handle empty styles array', () => {
    // Call with empty styles array
    const result = getStyle([])

    // Should return undefined since there are no valid styles
    expect(result).toBeUndefined()
  })
})
