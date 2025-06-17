import { targetMarkerGraphic, reColourMarkers } from '../../../src/js/provider/esri/marker'

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
          size: '38px',
          color: '#0b0c0c',
          outline: {
            color: '#ffffff',
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
          size: '38px',
          color: '#0b0c0c',
          outline: {
            color: '#ffffff',
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
          size: '38px',
          color: '#ffffff', // White color for dark theme
          outline: {
            color: '#0b0c0c',
            width: 0
          }
        }
      })
    })
  })

  describe('reColourMarkers', () => {
    let mockProvider
    let mockClonedHalo
    let mockClonedFill

    beforeEach(() => {
      // Create a cloned marker that matches the structure needed
      mockClonedHalo = {
        symbol: {
          color: '#000000',
          outline: {
            color: '#0b0c0c'
          }
        },
        clone: jest.fn().mockReturnThis() // Return itself when cloned
      }
      mockClonedFill = {
        symbol: {
          color: '#000000',
          outline: {
            color: '#0b0c0c'
          }
        },
        clone: jest.fn().mockReturnThis() // Return itself when cloned
      }

      mockProvider = {
        graphicsLayer: {
          remove: jest.fn(),
          add: jest.fn(),
          addMany: jest.fn()
        },
        targetMarker: [mockClonedHalo, mockClonedFill],
        isDark: false
      }
    })

    it('should recolour markers when target marker exists', async () => {
      await reColourMarkers(mockProvider)

      expect(mockProvider.graphicsLayer.remove).toHaveBeenCalledWith(mockProvider.targetMarker[0])
      expect(mockProvider.graphicsLayer.remove).toHaveBeenCalledWith(mockProvider.targetMarker[1])
      expect(mockProvider.targetMarker[0].clone).toHaveBeenCalled()
      expect(mockProvider.targetMarker[1].clone).toHaveBeenCalled()
      expect(mockProvider.graphicsLayer.addMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            symbol: expect.objectContaining({
              color: '#000000'
            })
          }),
          expect.objectContaining({
            symbol: expect.objectContaining({
              outline: expect.objectContaining({
                color: '#0b0c0c'
              })
            })
          })
        ])
      )
      expect(mockProvider.targetMarker[0].symbol.color).toBe('#000000')
      expect(mockProvider.targetMarker[1].symbol.outline.color).toBe('#0b0c0c')
    })

    it('should recolour markers with dark theme', async () => {
      mockProvider.isDark = true

      await reColourMarkers(mockProvider)

      const calledWithArray = mockProvider.graphicsLayer.addMany.mock.calls[0][0]
      expect(calledWithArray).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            symbol: expect.objectContaining({
              outline: expect.objectContaining({
                color: '#0b0c0c'
              })
            })
          }),
          expect.objectContaining({
            symbol: expect.objectContaining({
              color: '#ffffff'
            })
          })
        ]))
      // expect(newHalo.symbol.color).toBe('#ffffff')
    })

    it('should do nothing when target marker does not exist', async () => {
      mockProvider.targetMarker = null

      await reColourMarkers(mockProvider)

      expect(mockProvider.graphicsLayer.remove).not.toHaveBeenCalled()
      expect(mockProvider.graphicsLayer.add).not.toHaveBeenCalled()
    })

    it('should update provider with new graphic', async () => {
      const newHalo = { symbol: { outline: { color: '#ffffff' } } }
      const newFill = { symbol: { color: '#0b0c0c' } }
      mockProvider.targetMarker[0].clone.mockReturnValue(newHalo)
      mockProvider.targetMarker[1].clone.mockReturnValue(newFill)

      await reColourMarkers(mockProvider)

      expect(mockProvider.targetMarker[0]).toBe(newHalo)
      expect(mockProvider.targetMarker[1]).toBe(newFill)
    })
  })
})
