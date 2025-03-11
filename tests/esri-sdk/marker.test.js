import { targetMarkerGraphic, reColourMarkers } from '../../src/js/provider/esri-sdk/marker'

describe('Marker Module', () => {
  describe('targetMarkerGraphic', () => {
    const TEST_COORD = [100, 200]

    it('should create marker graphic with data', () => {
      const result = targetMarkerGraphic(TEST_COORD, false, true)

      expect(result).toEqual({
        geometry: {
          type: 'point',
          x: TEST_COORD[0],
          y: TEST_COORD[1],
          spatialReference: 27700
        },
        symbol: {
          type: 'simple-marker',
          path: expect.any(String), // The long path string for markers with data
          size: '68px',
          color: '#0b0c0c',
          outline: {
            width: 0
          }
        }
      })
    })

    it('should create marker graphic without data', () => {
      const result = targetMarkerGraphic(TEST_COORD, false, false)

      expect(result).toEqual({
        geometry: {
          type: 'point',
          x: TEST_COORD[0],
          y: TEST_COORD[1],
          spatialReference: 27700
        },
        symbol: {
          type: 'simple-marker',
          path: expect.any(String), // The long path string for markers without data
          size: '68px',
          color: '#505a5f',
          outline: {
            width: 0
          }
        }
      })
    })

    it('should create marker graphic with dark theme', () => {
      const result = targetMarkerGraphic(TEST_COORD, true, true)

      expect(result).toEqual({
        geometry: {
          type: 'point',
          x: TEST_COORD[0],
          y: TEST_COORD[1],
          spatialReference: 27700
        },
        symbol: {
          type: 'simple-marker',
          path: expect.any(String),
          size: '68px',
          color: '#ffffff', // White color for dark theme
          outline: {
            width: 0
          }
        }
      })
    })
  })

  describe('reColourMarkers', () => {
    let mockProvider
    let mockClonedMarker

    beforeEach(() => {
      // Create a cloned marker that matches the structure needed
      mockClonedMarker = {
        symbol: {
          color: '#000000'
        },
        clone: jest.fn().mockReturnThis() // Return itself when cloned
      }

      mockProvider = {
        graphicsLayer: {
          remove: jest.fn(),
          add: jest.fn()
        },
        targetMarker: mockClonedMarker,
        isDark: false
      }
    })

    it('should recolour markers when target marker exists', async () => {
      await reColourMarkers(mockProvider)

      expect(mockProvider.graphicsLayer.remove).toHaveBeenCalledWith(mockProvider.targetMarker)
      expect(mockProvider.targetMarker.clone).toHaveBeenCalled()
      expect(mockProvider.graphicsLayer.add).toHaveBeenCalledWith(expect.objectContaining({
        symbol: {
          color: '#0b0c0c'
        }
      }))
      expect(mockProvider.targetMarker.symbol.color).toBe('#0b0c0c')
    })

    it('should recolour markers with dark theme', async () => {
      mockProvider.isDark = true

      await reColourMarkers(mockProvider)

      const newGraphic = mockProvider.graphicsLayer.add.mock.calls[0][0]
      expect(newGraphic.symbol.color).toBe('#ffffff')
    })

    it('should do nothing when target marker does not exist', async () => {
      mockProvider.targetMarker = null

      await reColourMarkers(mockProvider)

      expect(mockProvider.graphicsLayer.remove).not.toHaveBeenCalled()
      expect(mockProvider.graphicsLayer.add).not.toHaveBeenCalled()
    })

    it('should update provider with new graphic', async () => {
      const newGraphic = { symbol: { color: '#0b0c0c' } }
      mockProvider.targetMarker.clone.mockReturnValue(newGraphic)

      await reColourMarkers(mockProvider)

      expect(mockProvider.targetMarker).toBe(newGraphic)
    })
  })
})
