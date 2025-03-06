import { getFocusPadding, getFocusBounds, getMapPixel, getDescription } from '../../src/js/lib/viewport'

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
