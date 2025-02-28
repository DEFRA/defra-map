import { Draw } from '../../src/js/provider/esri-sdk/draw'
import { defaults } from '../../src/js/provider/esri-sdk/constants'
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'

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
    setupMockProvider()
  })

  function setupMockProvider () {
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
  }

  describe('Constructor', () => {
    it('should initialize Draw with provider reference', () => {
      drawInstance = new Draw(mockProvider, {})
      expect(mockProvider.draw).toBe(drawInstance)
    })

    it('should invoke create() with provided feature', () => {
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
      const createSpy = jest.spyOn(Draw.prototype, 'create')
      drawInstance = new Draw(mockProvider, { feature })
      expect(createSpy).toHaveBeenCalledWith(feature)
      createSpy.mockRestore()
    })

    it('should start with "frame" mode when no feature is provided', () => {
      const startSpy = jest.spyOn(Draw.prototype, 'start')
      drawInstance = new Draw(mockProvider, {})
      expect(startSpy).toHaveBeenCalledWith('frame')
      startSpy.mockRestore()
    })
  })

  describe('start()', () => {
    it('should zoom to the existing graphic when available', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.start('default')
      expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
    })

    it('should remove all graphics when started in "frame" mode"', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.start('frame')
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })

    it('should initiate editGraphic() when mode is not "frame"', () => {
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

    it('should generate a new graphic from paddingBox if no existing graphic is found', () => {
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
    it('should cancel the active sketchViewModel if available', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { cancel: jest.fn() }
      drawInstance.reset()
      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it('should clear all graphics from graphicsLayer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.reset()
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })
  })

  describe('delete()', () => {
    it('should remove the stored oGraphic reference', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.delete()
      expect(drawInstance.oGraphic).toBeNull()
    })

    it('should remove all graphics from the graphicsLayer', () => {
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
    it('should generate a new Graphic from the provided feature', () => {
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

    it('should add the generated graphic using addGraphic()', () => {
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

    it('should default to paddingBox graphic if no other graphics exist', () => {
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

    it('should save the current zoom level from view.zoom', () => {
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

    it('should retrieve and update the first graphic from graphicsLayer', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance.reColour()
      expect(addGraphicSpy).toHaveBeenCalledWith(mockGraphic)
    })

    it('should not perform any action if no graphic exists', () => {
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

    it('should store the created SketchViewModel instance', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(drawInstance.sketchViewModel).toBe(sketchViewModelMock)
    })

    it('should register event listeners for update and delete events', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(onSpy).toHaveBeenCalledWith(['update', 'delete'], expect.any(Function))
    })

    it('should call update() on sketchViewModel with the provided graphic', () => {
      jest.useFakeTimers()
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      jest.runAllTimers()
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Object))
      jest.useRealTimers()
    })
  })

  describe('finishEdit()', () => {
    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { complete: jest.fn() }
    })

    it('should call complete() on sketchViewModel to finalize the edit', () => {
      drawInstance.finishEdit()
      expect(drawInstance.sketchViewModel.complete).toHaveBeenCalled()
    })

    it('should return the first available graphic from graphicsLayer', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      const result = drawInstance.finishEdit()
      expect(result).toBe(mockGraphic)
    })

    it('should return undefined if no graphic exists in graphicsLayer', () => {
      mockProvider.graphicsLayer.graphics.items = []
      const result = drawInstance.finishEdit()
      expect(result).toBeUndefined()
    })
  })

  describe('destroy()', () => {
    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { complete: jest.fn(), cancel: jest.fn() }
    })

    it('should remove the layer reference from sketchViewModel after completion', () => {
      drawInstance.destroy()
      expect(drawInstance.sketchViewModel.layer).toBeNull()
    })
  })

  describe('getBounds()', () => {
    it('should call getBoundingClientRect() to retrieve element dimensions', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockElement = document.createElement('div')
      const mockParent = document.createElement('div')
      mockParent.classList.add('fm-o-viewport')

      // Ensure the element is inside a valid viewport
      jest.spyOn(mockElement, 'closest').mockReturnValue(mockParent)
      const getBoundingClientRectSpy = jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 10,
        top: 20,
        width: 100,
        height: 50
      })
      jest.spyOn(mockParent, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 500,
        height: 500
      })

      drawInstance.getBounds(mockElement)

      expect(getBoundingClientRectSpy).toHaveBeenCalled()

      getBoundingClientRectSpy.mockRestore()
    })

    it('should find the closest .fm-o-viewport parent element', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockElement = document.createElement('div')
      const mockParent = document.createElement('div')
      mockParent.classList.add('fm-o-viewport')

      const closestSpy = jest.spyOn(mockElement, 'closest').mockReturnValue(mockParent)

      drawInstance.getBounds(mockElement)
      expect(closestSpy).toHaveBeenCalledWith('.fm-o-viewport')

      closestSpy.mockRestore()
    })

    it('should compute northwest and southeast coordinates using view.toMap()', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockElement = document.createElement('div')
      const mockParent = document.createElement('div')
      mockParent.classList.add('fm-o-viewport')

      jest.spyOn(mockElement, 'closest').mockReturnValue(mockParent)
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 10,
        top: 20,
        width: 100,
        height: 50
      })

      const toMapSpy = jest.spyOn(mockProvider.view, 'toMap')
        .mockReturnValueOnce({ x: 0, y: 0 }) // NW coordinate
        .mockReturnValueOnce({ x: 1, y: 1 }) // SE coordinate

      drawInstance.getBounds(mockElement)

      expect(toMapSpy).toHaveBeenCalledTimes(2)
      expect(toMapSpy).toHaveBeenCalledWith({ x: 10, y: 20 }) // NW point
      expect(toMapSpy).toHaveBeenCalledWith({ x: 110, y: 70 }) // SE point

      toMapSpy.mockRestore()
    })

    it('should return bounding box in the correct format [nw.x, nw.y, se.x, se.y]', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockElement = document.createElement('div')
      const mockParent = document.createElement('div')
      mockParent.classList.add('fm-o-viewport')

      jest.spyOn(mockElement, 'closest').mockReturnValue(mockParent)
      jest.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 10,
        top: 20,
        width: 100,
        height: 50
      })

      jest.spyOn(mockProvider.view, 'toMap')
        .mockReturnValueOnce({ x: 0, y: 0 }) // NW coordinate
        .mockReturnValueOnce({ x: 1, y: 1 }) // SE coordinate

      const result = drawInstance.getBounds(mockElement)

      expect(result).toEqual([0, 0, 1, 1])
    })
  })

  describe('addGraphic()', () => {
    it('should remove all existing graphics from graphicsLayer', () => {
      const drawInstance = new Draw(mockProvider, {})
      const removeAllSpy = jest.spyOn(mockProvider.graphicsLayer, 'removeAll')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.addGraphic(mockGraphic)

      expect(removeAllSpy).toHaveBeenCalled()
      removeAllSpy.mockRestore()
    })

    it('should clone the given graphic', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {}, geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] } }

      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(mockGraphic.clone).toHaveBeenCalled()
    })

    it('should set clone.symbol.color based on isDark setting', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }

      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(clonedGraphic.symbol.color).toBe(defaults.POLYGON_QUERY_STROKE)

      drawInstance.provider.isDark = true
      drawInstance.addGraphic(mockGraphic)

      expect(clonedGraphic.symbol.color).toBe(defaults.POLYGON_QUERY_STROKE_DARK)
    })

    it('should add the cloned graphic to graphicsLayer', () => {
      const drawInstance = new Draw(mockProvider, {})
      const addSpy = jest.spyOn(mockProvider.graphicsLayer, 'add')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }
      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(addSpy).toHaveBeenCalledWith(clonedGraphic)
      addSpy.mockRestore()
    })

    it('should call update() on sketchViewModel if an active tool exists', () => {
      const drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { update: jest.fn(), activeTool: 'move' }

      const updateSpy = jest.spyOn(drawInstance.sketchViewModel, 'update')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }
      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(updateSpy).toHaveBeenCalledWith(clonedGraphic)
      updateSpy.mockRestore()
    })

    it('should reorder graphicsLayer to zIndex = 99 on map', () => {
      const drawInstance = new Draw(mockProvider, {})
      const reorderSpy = jest.spyOn(mockProvider.map, 'reorder')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }
      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(reorderSpy).toHaveBeenCalledWith(mockProvider.graphicsLayer, 99)
      reorderSpy.mockRestore()
    })

    it('should return the cloned graphic', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {}, geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] } }

      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      const result = drawInstance.addGraphic(mockGraphic)

      expect(result).toBe(clonedGraphic)
    })
  })

  describe('getFeature()', () => {
    it('should return an object with type "feature" and correct geometry', () => {
      drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }

      const result = drawInstance.getFeature(mockGraphic)

      expect(result).toEqual({
        type: 'feature',
        geometry: {
          type: 'polygon',
          coordinates: mockGraphic.geometry.rings
        }
      })
    })

    it('should correctly extract geometry.rings from the given graphic', () => {
      drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[5, 5], [6, 6], [7, 7]]] }

      const result = drawInstance.getFeature(mockGraphic)

      expect(result.geometry.coordinates).toEqual(mockGraphic.geometry.rings)
    })
  })

  describe('getGraphicFromElement()', () => {
    let Draw, Graphic, drawInstance, mockProvider

    beforeAll(() => {
      // Reset modules so we can set up an isolated mock
      jest.resetModules()
      jest.doMock('@arcgis/core/Graphic', () => {
        class FakeGraphic {
          constructor (params) {
            this.geometry = params.geometry
            this.symbol = params.symbol
          }

          clone () {
            return new FakeGraphic({
              geometry: this.geometry,
              symbol: this.symbol
            })
          }
        }
        return FakeGraphic
      })
      // Re-import with the new mock
      Draw = require('../../src/js/provider/esri-sdk/draw').Draw
      Graphic = require('@arcgis/core/Graphic')
    })

    beforeEach(() => {
      mockProvider = {
        view: { toMap: jest.fn(({ x, y }) => ({ x, y })) },
        graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() },
        paddingBox: document.createElement('div')
      }
      // Prevent start() from running in the constructor.
      jest.spyOn(Draw.prototype, 'start').mockImplementation(() => {})
      drawInstance = new Draw(mockProvider, {})
      Draw.prototype.start.mockRestore()
    })

    it('should call getBounds(el) to retrieve bounding box', () => {
      const el = document.createElement('div')
      const getBoundsSpy = jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      drawInstance.getGraphicFromElement(el)
      expect(getBoundsSpy).toHaveBeenCalledWith(el)
      getBoundsSpy.mockRestore()
    })

    it('should create a polygon Graphic using the calculated bounds', () => {
      const el = document.createElement('div')
      jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      const result = drawInstance.getGraphicFromElement(el)
      expect(result).toBeDefined()
      expect(result.geometry).toBeDefined()
      expect(result.geometry.type).toBe('polygon')
      expect(result.geometry.rings).toEqual([
        [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
      ])
      expect(result.geometry.spatialReference).toBe(27700)
    })

    it('should use default polygon stroke settings from defaults.POLYGON_QUERY_STROKE', () => {
      const el = document.createElement('div')
      jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      const result = drawInstance.getGraphicFromElement(el)
      expect(result.symbol).toEqual({
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      })
    })

    it('should return the created Graphic instance', () => {
      const el = document.createElement('div')
      jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      const result = drawInstance.getGraphicFromElement(el)
      expect(result).toBeInstanceOf(Graphic)
    })
  })

  describe('getGraphicFromFeature()', () => {
    let Draw, Graphic, drawInstance, mockProvider

    beforeAll(() => {
      jest.resetModules()
      jest.doMock('@arcgis/core/Graphic', () => {
        class FakeGraphic {
          constructor (params) {
            this.geometry = params.geometry
            this.symbol = params.symbol
          }

          clone () {
            return new FakeGraphic({
              geometry: this.geometry,
              symbol: this.symbol
            })
          }
        }
        return FakeGraphic
      })
      Draw = require('../../src/js/provider/esri-sdk/draw').Draw
      Graphic = require('@arcgis/core/Graphic')
    })

    beforeEach(() => {
      mockProvider = {
        view: { toMap: jest.fn(({ x, y }) => ({ x, y })) },
        graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() },
        paddingBox: document.createElement('div')
      }
      // Prevent start() from running during instantiation.
      jest.spyOn(Draw.prototype, 'start').mockImplementation(() => {})
      drawInstance = new Draw(mockProvider, {})
      Draw.prototype.start.mockRestore()
    })

    it('should extract rings from feature.geometry.coordinates', () => {
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic.geometry.rings).toEqual(feature.geometry.coordinates)
    })

    it('should create a polygon Graphic with extracted coordinates', () => {
      const feature = { geometry: { coordinates: [[[3, 3], [4, 4], [5, 5]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic).toBeDefined()
      expect(graphic.geometry).toBeDefined()
      expect(graphic.geometry.type).toBe('polygon')
      expect(graphic.geometry.rings).toEqual(feature.geometry.coordinates)
      expect(graphic.geometry.spatialReference).toBe(27700)
    })

    it('should use default polygon stroke settings from defaults.POLYGON_QUERY_STROKE', () => {
      const feature = { geometry: { coordinates: [[[6, 6], [7, 7], [8, 8]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic.symbol).toEqual({
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      })
    })

    it('should return the created Graphic instance', () => {
      const feature = { geometry: { coordinates: [[[9, 9], [10, 10], [11, 11]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic).toBeInstanceOf(Graphic)
    })
  })

  describe('handleUpdateDelete(e)', () => {
    let drawInstance, mockProvider

    beforeEach(() => {
      mockProvider = {
        view: { toMap: jest.fn() },
        graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() }
      }
      drawInstance = new Draw(mockProvider, {})
      drawInstance.undo = jest.fn()
      drawInstance.cancel = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should call undo() if toolEventInfo.type is "reshape-stop" and area <= 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'reshape-stop' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(0)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it('should call undo() if toolEventInfo.type is "vertex-remove" and area <= 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'vertex-remove' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(-1)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it('should not call undo() if toolEventInfo.type is "reshape-stop" and area > 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'reshape-stop' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(5)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).not.toHaveBeenCalled()
    })

    it('should call undo() if toolEventInfo.type is "reshape" and geometry.isSelfIntersecting is true', () => {
      const fakeGeometry = { isSelfIntersecting: true }
      const event = {
        toolEventInfo: { type: 'reshape' },
        graphics: [{ geometry: fakeGeometry }]
      }
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it('should not call undo() if toolEventInfo.type is "reshape" and geometry.isSelfIntersecting is false', () => {
      const fakeGeometry = { isSelfIntersecting: false }
      const event = {
        toolEventInfo: { type: 'reshape' },
        graphics: [{ geometry: fakeGeometry }]
      }
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).not.toHaveBeenCalled()
    })

    it('should call cancel() if toolEventInfo.type is "move-start"', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'move-start' },
        graphics: [{ geometry: fakeGeometry }]
      }
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.cancel).toHaveBeenCalled()
    })
  })
})
