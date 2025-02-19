import { Draw } from '../../src/js/provider/esri-sdk/draw'
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel.js'

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
    mockParent.classList.add('fm-o-viewport')

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

  describe('finish()', () => {
    let getGraphicSpy

    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { cancel: jest.fn(), complete: jest.fn() }
      getGraphicSpy = jest.spyOn(drawInstance, 'getGraphicFromElement')
    })

    afterEach(() => {
      getGraphicSpy.mockRestore()
    })

    it('should retrieve the correct graphic in priority order', () => {
      const mockFinishedGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockFinishedGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockFinishedGraphic)
      mockProvider.graphicsLayer.graphics.items = []
      const result = drawInstance.finish()
      expect(result).toBeDefined()
      expect(drawInstance.finishEdit).toHaveBeenCalled()
      expect(result.geometry.coordinates).toEqual(mockFinishedGraphic.geometry.rings)
    })

    it('should use graphicsLayer graphic if finishEdit() returns null', () => {
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(null)
      const mockLayerGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockLayerGraphic.geometry = { rings: [[[3, 3], [4, 4], [5, 5]]] }
      mockProvider.graphicsLayer.graphics.items = [mockLayerGraphic]
      const result = drawInstance.finish()
      expect(result).toBeDefined()
      expect(drawInstance.finishEdit).toHaveBeenCalled()
      expect(result.geometry.coordinates).toEqual(mockLayerGraphic.geometry.rings)
    })

    it('should use paddingBox graphic if no other graphics are available', () => {
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(null)
      mockProvider.graphicsLayer.graphics.items = []
      const mockElementGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockElementGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      getGraphicSpy.mockReturnValue(mockElementGraphic)
      const result = drawInstance.finish()
      expect(result).toBeDefined()
      expect(drawInstance.finishEdit).toHaveBeenCalled()
      expect(getGraphicSpy).toHaveBeenCalled()
      expect(result.geometry.coordinates).toEqual(mockElementGraphic.geometry.rings)
    })

    it('should cancel sketchViewModel after finishing', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it('should store the cloned finished graphic in oGraphic', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue(mockGraphic)
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      mockGraphic.symbol = {}
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.oGraphic).toBeDefined()
      expect(drawInstance.oGraphic.clone).toBeDefined()
    })

    it('should save the original zoom level from view.zoom', () => {
      mockProvider.view.zoom = 15
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.originalZoom).toBe(15)
    })

    it('should add the final graphic using addGraphic()', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue(mockGraphic)
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      mockGraphic.symbol = {}
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.finish()
      expect(addGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
      addGraphicSpy.mockRestore()
    })

    it('should return the feature representation using getFeature()', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      const getFeatureSpy = jest.spyOn(drawInstance, 'getFeature')
      const result = drawInstance.finish()
      expect(getFeatureSpy).toHaveBeenCalledWith(mockGraphic)
      expect(result).toBeDefined()
      getFeatureSpy.mockRestore()
    })
  })

  describe('reColour()', () => {
    let addGraphicSpy

    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
    })

    afterEach(() => {
      addGraphicSpy.mockRestore()
    })

    it('should retrieve the first graphic from graphicsLayer', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance.reColour()
      expect(addGraphicSpy).toHaveBeenCalledWith(mockGraphic)
    })

    it('should do nothing if no graphic exists', () => {
      mockProvider.graphicsLayer.graphics.items = []
      drawInstance.reColour()
      expect(addGraphicSpy).not.toHaveBeenCalled()
    })

    it('should reapply addGraphic() to update color', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance.reColour()
      expect(addGraphicSpy).toHaveBeenCalledWith(mockGraphic)
    })
  })

  describe('editGraphic()', () => {
    let updateSpy, onSpy, sketchViewModelMock

    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      sketchViewModelMock = {
        on: jest.fn(),
        update: jest.fn(),
        complete: jest.fn(),
        cancel: jest.fn(),
        activeTool: null,
        defaultUpdateOptions: {
          tool: 'reshape',
          updateOnGraphicClick: false,
          multipleSelectionEnabled: false,
          toggleToolOnClick: false,
          highlightOptions: { enabled: false }
        }
      }
      SketchViewModel.mockImplementation(() => sketchViewModelMock)
      updateSpy = jest.spyOn(sketchViewModelMock, 'update')
      onSpy = jest.spyOn(sketchViewModelMock, 'on')
    })

    afterEach(() => {
      updateSpy.mockRestore()
      onSpy.mockRestore()
    })

    it('should create a SketchViewModel with the correct parameters', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(SketchViewModel).toHaveBeenCalledWith({
        view: mockProvider.view,
        layer: mockProvider.graphicsLayer,
        defaultUpdateOptions: {
          tool: 'reshape',
          updateOnGraphicClick: false,
          multipleSelectionEnabled: false,
          toggleToolOnClick: false,
          highlightOptions: { enabled: false }
        }
      })
      expect(drawInstance.sketchViewModel).toBe(sketchViewModelMock)
    })

    it('should store SketchViewModel in this.sketchViewModel', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(drawInstance.sketchViewModel).toBe(sketchViewModelMock)
    })

    it('should register event listeners for update and delete events', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(onSpy).toHaveBeenCalledWith(['update', 'delete'], expect.any(Function))
    })

    it('should call update() on sketchViewModel with the given graphic', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Object))
    })
  })
})
