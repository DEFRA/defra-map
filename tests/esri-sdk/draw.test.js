import { Draw } from '../../src/js/provider/esri-sdk/draw'

jest.mock('@arcgis/core/Graphic', () => {
  return jest.fn().mockImplementation(() => ({
    clone: jest.fn().mockReturnValue({
      symbol: {},
      geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] }
    })
  }))
})

jest.mock('@arcgis/core/widgets/Sketch/SketchViewModel.js', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    activeTool: null
  }))
})

describe('Draw Class', () => {
  let mockProvider, drawInstance

  beforeEach(() => {
    const mockParent = document.createElement('div')
    mockParent.classList.add('fm-o-viewport') // Ensure closest() finds a match

    mockProvider = {
      draw: null,
      view: { goTo: jest.fn(), zoom: 10, toMap: jest.fn(() => ({ x: 100, y: 100 })) },
      graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() },
      map: { reorder: jest.fn() },
      paddingBox: document.createElement('div'),
      isDark: false
    }

    mockProvider.paddingBox.closest = () => mockParent
    mockProvider.paddingBox.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 100,
      height: 50
    })
  })

  describe('Constructor', () => {
    it('should initialize Draw with provider reference', () => {
      drawInstance = new Draw(mockProvider, {})
      expect(mockProvider.draw).toBe(drawInstance)
    })

    it('should call create() if a feature is provided', () => {
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
      const createSpy = jest.spyOn(Draw.prototype, 'create')
      drawInstance = new Draw(mockProvider, { feature })
      expect(createSpy).toHaveBeenCalledWith(feature)
      createSpy.mockRestore()
    })

    it('should call start("frame") if no feature is provided', () => {
      const startSpy = jest.spyOn(Draw.prototype, 'start')
      drawInstance = new Draw(mockProvider, {})
      expect(startSpy).toHaveBeenCalledWith('frame')
      startSpy.mockRestore()
    })
  })

  describe('start()', () => {
    it('should zoom to existing graphic if oGraphic exists', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.start('default')
      expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
    })

    it('should remove all graphics if mode is "frame"', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.start('frame')
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })

    it('should call editGraphic() when mode is not "frame"', () => {
      const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.start('default')
      expect(editGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
      editGraphicSpy.mockRestore()
    })
  })

  describe('edit()', () => {
    it('should edit an existing graphic if available', () => {
      const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
      drawInstance = new Draw(mockProvider, {})

      const existingGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      existingGraphic.clone = jest.fn().mockReturnValue(existingGraphic)

      mockProvider.graphicsLayer.graphics.items = [existingGraphic]

      drawInstance.edit()

      expect(editGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
      editGraphicSpy.mockRestore()
    })

    it('should create a new graphic from paddingBox if no existing graphic is found', () => {
      const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
      const getGraphicSpy = jest.spyOn(Draw.prototype, 'getGraphicFromElement')
      drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      getGraphicSpy.mockReturnValue(mockGraphic)

      drawInstance.edit()

      expect(editGraphicSpy).toHaveBeenCalledWith(mockGraphic)
      editGraphicSpy.mockRestore()
      getGraphicSpy.mockRestore()
    })
  })

  describe('reset()', () => {
    it('should cancel sketchViewModel if active', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { cancel: jest.fn() }

      drawInstance.reset()

      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it('should remove all graphics from the layer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.reset()
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })
  })

  describe('delete()', () => {
    it('should remove oGraphic reference', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.delete()

      expect(drawInstance.oGraphic).toBeNull()
    })

    it('should remove all graphics from the layer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.delete()
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })
  })

  describe('cancel()', () => {
    it('should cancel sketchViewModel if active', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { cancel: jest.fn() }

      drawInstance.cancel()

      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it('should reinstate the original graphic using addGraphic()', () => {
      const addGraphicSpy = jest.spyOn(Draw.prototype, 'addGraphic')
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.cancel()

      expect(addGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
      addGraphicSpy.mockRestore()
    })
  })

  describe('create()', () => {
    it('should create a new Graphic from the given feature', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
  
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      jest.spyOn(drawInstance, 'getGraphicFromFeature').mockReturnValue(mockGraphic)
  
      drawInstance.create(feature)
  
      expect(drawInstance.getGraphicFromFeature).toHaveBeenCalledWith(feature)
    })
  
    it('should store the cloned graphic in oGraphic', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
  
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue({
        ...mockGraphic,
        symbol: {}
      })
  
      jest.spyOn(drawInstance, 'getGraphicFromFeature').mockReturnValue(mockGraphic)
  
      drawInstance.create(feature)
  
      expect(drawInstance.oGraphic).toBeDefined()
      expect(drawInstance.oGraphic.clone).toBeDefined()
      expect(drawInstance.oGraphic.symbol).toBeDefined()
    })
  
    it('should add the new graphic using addGraphic()', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
  
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue({
        ...mockGraphic,
        symbol: {}
      })
  
      jest.spyOn(drawInstance, 'getGraphicFromFeature').mockReturnValue(mockGraphic)
  
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
  
      drawInstance.create(feature)
  
      expect(addGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
      addGraphicSpy.mockRestore()
    })
  })  
})
