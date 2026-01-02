import { getDetail, getViewport, getFeatures, getDimensions } from '../../src/js/provider/esri-sdk/query'
import { defaults } from '../../src/js/provider/esri-sdk/constants'

jest.mock('@arcgis/core/views/MapView', () => {
  return jest.fn().mockImplementation(() => ({
    hitTest: jest.fn(),
    toMap: jest.fn(),
    center: { x: 100, y: 200 },
    zoom: 10,
    extent: { xmin: 0, ymin: 0, xmax: 1000, ymax: 1000 }
  }))
})

describe('Query Module', () => {
  let mockProvider

  beforeEach(() => {
    mockProvider = {
      view: {
        hitTest: jest.fn(),
        toMap: jest.fn(),
        center: { x: 100, y: 200 },
        zoom: 10,
        extent: { xmin: 0, ymin: 0, xmax: 1000, ymax: 1000 }
      },
      map: {
        layers: [
          { id: 'layer1', visible: true },
          { id: 'layer2', visible: false },
          { id: 'layer3', visible: true }
        ]
      },
      locationLayers: ['layer1', 'layer3'],
      getNearest: jest.fn(),
      reverseGeocodeToken: 'mock-token'
    }
  })

  describe('getDetail()', () => {
    beforeEach(() => {
      mockProvider.view.toMap.mockReturnValue({ x: 500, y: 500 })
      mockProvider.view.hitTest.mockResolvedValue({
        results: [
          {
            layer: { id: 'layer1' },
            graphic: { attributes: { name: 'Feature 1' }, uid: '1' }
          }
        ]
      })
      mockProvider.getNearest.mockResolvedValue({ name: 'Mock Place' })
    })

    it('should return viewport, features, and place information', async () => {
      const point = [10, 10]
      const detail = await getDetail(mockProvider, point, true)

      expect(detail).toHaveProperty('bounds')
      expect(detail).toHaveProperty('center')
      expect(detail).toHaveProperty('zoom')
      expect(detail).toHaveProperty('features')
      expect(detail).toHaveProperty('place')
      expect(detail.resultType).toBe('pixel')
    })

    it('should not call getNearest if not user-initiated', async () => {
      const point = [10, 10]
      await getDetail(mockProvider, point, false)

      expect(mockProvider.getNearest).not.toHaveBeenCalled()
    })

    it('should not call getNearest if user-initiated is not passed', async () => {
      const point = [10, 10]
      await getDetail(mockProvider, point)
      expect(mockProvider.getNearest).not.toHaveBeenCalled()
    })

    it('should call getNearest with correct parameters when user-initiated', async () => {
      const point = [10, 10]
      await getDetail(mockProvider, point, true)

      expect(mockProvider.getNearest).toHaveBeenCalledWith([500, 500], 'mock-token')
    })

    it('should combine results from getViewport and getFeatures', async () => {
      const point = [10, 10]
      const detail = await getDetail(mockProvider, point, false)

      expect(detail.bounds).toEqual([0, 0, 1000, 1000])
      expect(detail.features.resultType).toBe('pixel')
    })
  })

  describe('getViewport()', () => {
    it('should retrieve bounds, center, and zoom from the view', async () => {
      const viewport = await getViewport(mockProvider)

      expect(viewport).toHaveProperty('bounds')
      expect(viewport).toHaveProperty('center')
      expect(viewport).toHaveProperty('zoom')
    })

    it('should format center coordinates correctly', async () => {
      mockProvider.view.center = { x: 123.456789, y: 987.654321 }
      const viewport = await getViewport(mockProvider)

      expect(viewport.center).toEqual([123.5, 987.7])
    })

    it('should format zoom level using defaults precision', async () => {
      mockProvider.view.zoom = 12.3456789
      const viewport = await getViewport(mockProvider)

      expect(viewport.zoom).toEqual(parseFloat(12.3456789.toFixed(defaults.PRECISION)))
    })

    it('should extract extent bounds correctly', async () => {
      mockProvider.view.extent = { xmin: 10, ymin: 20, xmax: 30, ymax: 40 }
      const viewport = await getViewport(mockProvider)

      expect(viewport.bounds).toEqual([10, 20, 30, 40])
    })
  })

  describe('getFeatures()', () => {
    beforeEach(() => {
      mockProvider.view.toMap.mockReturnValue({ x: 500, y: 500 })
      mockProvider.view.hitTest.mockResolvedValue({
        results: [
          {
            layer: { id: 'layer1' },
            graphic: { attributes: { name: 'Feature 1' }, uid: '1' }
          },
          {
            layer: { id: 'layer3' },
            graphic: { attributes: { name: 'Feature 2' }, uid: '2' }
          },
          {
            layer: { id: 'other-layer' },
            graphic: { attributes: { name: 'Feature 3' }, uid: '3' }
          }
        ]
      })
    })

    it('should filter results by locationLayers', async () => {
      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features.items.length).toBe(2)
      expect(features.items[0].layer).toBe('layer1')
      expect(features.items[1].layer).toBe('layer3')
    })

    it('should format feature items correctly', async () => {
      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features.items[0]).toHaveProperty('id', '1')
      expect(features.items[0]).toHaveProperty('layer', 'layer1')
      expect(features.items[0]).toHaveProperty('name', 'Feature 1')
    })

    it('should detect visible pixel layers', async () => {
      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features.isPixelFeaturesInMap).toBe(true)
    })

    it('should report no visible pixel layers when none are visible', async () => {
      mockProvider.map.layers = [
        { id: 'layer1', visible: false },
        { id: 'layer3', visible: false }
      ]

      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features.isPixelFeaturesInMap).toBe(false)
    })

    it('should confirm if features exist at the pixel', async () => {
      mockProvider.view.hitTest.mockResolvedValueOnce({
        results: [
          {
            layer: { id: 'layer1' },
            graphic: { attributes: {}, uid: '1' }
          }
        ]
      })

      const point1 = [10, 10]
      const features1 = await getFeatures(mockProvider, point1)
      expect(features1.isPixelFeaturesAtPixel).toBe(true)

      mockProvider.view.hitTest.mockResolvedValueOnce({ results: [] })

      const point2 = [20, 20]
      const features2 = await getFeatures(mockProvider, point2)
      expect(features2.isPixelFeaturesAtPixel).toBe(false)
    })

    it('should transform screen coordinates to map coordinates', async () => {
      mockProvider.view.toMap.mockReturnValue({ x: 123.4567, y: 456.7890 })

      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features.coord).toEqual([123, 457])
      expect(mockProvider.view.toMap).toHaveBeenCalledWith({ x: 10, y: 10 })
    })

    it('should return a structured features object with required properties', async () => {
      const point = [10, 10]
      const features = await getFeatures(mockProvider, point)

      expect(features).toHaveProperty('resultType', 'pixel')
      expect(features).toHaveProperty('items')
    })
  })

  describe('getDimensions', () => {
    it('should return {} if drawMode is not frame or vertex', async () => {
      expect(getDimensions({})).toEqual({})
    })

    it('should call provider.draw.getDimensions if it exists', async () => {
      const getDimensionsMock = jest.fn(() => 'TEST DIMENSIONS')
      const result = getDimensions({ draw: { getDimensions: getDimensionsMock, drawMode: 'vertex' } })
      expect(result).toEqual('TEST DIMENSIONS')
      expect(getDimensionsMock).toHaveBeenCalled()
    })
  })
})
