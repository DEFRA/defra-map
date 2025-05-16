import { Draw } from '../../src/js/provider/esri-sdk/draw'
import { defaults } from '../../src/js/provider/esri-sdk/constants'
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js'

jest.mock('@arcgis/core/Graphic', () => {
  return jest.fn().mockImplementation(() => ({
    clone: jest.fn().mockReturnValue({
      symbol: {},
      geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] }
    })
  }))
})

jest.mock('@arcgis/core/widgets/Sketch/SketchViewModel.js')

jest.mock('@arcgis/core/layers/GraphicsLayer.js')

describe('Draw Class', () => {
  let mockProvider, drawInstance, sketchViewModelMock

  beforeEach(() => {
    setupMockProvider()

    sketchViewModelMock = {
      on: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
      reset: jest.fn(),
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
  })

  function setupMockProvider () {
    const mockParent = document.createElement('div')
    mockParent.classList.add('fm-o-viewport')

    mockProvider = {
      draw: null,
      view: { goTo: jest.fn(), zoom: 10, toMap: jest.fn(() => ({ x: 100, y: 100 })) },
      graphicsLayer: { graphics: { items: [] }, removeAll: jest.fn(), add: jest.fn() },
      emptyLayer: { id: 'empty', visible: false },
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

    it('should start with \'undefined, undefined\' mode when no feature is provided', () => {
      const editSpy = jest.spyOn(Draw.prototype, 'edit')
      drawInstance = new Draw(mockProvider, {})
      expect(editSpy).toHaveBeenCalledWith(undefined, undefined)
      editSpy.mockRestore()
    })

    it('should generate a new Graphic from the provided coordinates', () => {
      const createGraphicSpy = jest.spyOn(Draw.prototype, 'createGraphic')
      const shape = 'square'
      const coordinates = [[[0, 0], [1, 1], [2, 2]]]
      const feature = { geometry: { coordinates } }
      drawInstance = new Draw(mockProvider, { feature, shape })
      expect(createGraphicSpy).toHaveBeenCalledWith(shape, coordinates)
      createGraphicSpy.mockRestore()
    })

    it('should store the cloned graphic in oGraphic', () => {
      jest.spyOn(Draw.prototype, 'createGraphic').mockReturnValue({ symbol: {} })
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
      drawInstance = new Draw(mockProvider, { feature, shape: 'square' })
      console.log(drawInstance.oGraphic)
      expect(drawInstance.oGraphic).toBeDefined()
      expect(drawInstance.oGraphic.symbol).toBeDefined()
    })

    it('should add the generated graphic using addGraphic()', () => {
      jest.spyOn(Draw.prototype, 'createGraphic').mockReturnValue({ symbol: {}, clone: jest.fn() })
      const feature = { geometry: { coordinates: [[[0, 0], [1, 1], [2, 2]]] } }
      const addGraphicSpy = jest.spyOn(Draw.prototype, 'addGraphic')
      drawInstance = new Draw(mockProvider, { mode: 'default', feature })
      expect(addGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
      addGraphicSpy.mockRestore()
    })

    it('should create a SketchViewModel with the correct parameters', () => {
      const graphicsLayerMock = { id: 'empty', visible: false }
      GraphicsLayer.mockImplementation(() => graphicsLayerMock)
      drawInstance = new Draw(mockProvider, {})
      expect(SketchViewModel).toHaveBeenCalledWith({
        view: mockProvider.view,
        layer: mockProvider.emptyLayer,
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
      drawInstance = new Draw(mockProvider, {})
      expect(drawInstance.sketchViewModel).toBe(sketchViewModelMock)
    })

    it('should register event listeners for update and delete events', () => {
      const onSpy = jest.spyOn(sketchViewModelMock, 'on')
      drawInstance = new Draw(mockProvider, {})
      expect(onSpy).toHaveBeenCalledWith(['update', 'delete'], expect.any(Function))
    })
  })

  describe('edit()', () => {
    it('should zoom to the existing graphic when available', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.edit('default')
      expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
    })

    it('should remove all graphics when editing in "frame" mode', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.edit('frame')
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })

    it('should initiate sketchViewModal.update() when mode is "vertex" and there is a graphic', () => {
      jest.useFakeTimers()
      const graphic = { attributes: { id: 'polygon' }, geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] } }
      mockProvider.graphicsLayer.graphics.items = [graphic]
      drawInstance = new Draw(mockProvider, {})
      drawInstance.edit('vertex', 'polygon')
      expect(sketchViewModelMock.layer).toEqual(mockProvider.graphicsLayer)
      jest.runAllTimers()
      expect(sketchViewModelMock.update).toHaveBeenCalledWith([graphic], expect.any(Object))
      jest.useRealTimers()
    })

    it('should initiate sketchViewModal.create() when mode is "vertex" and no graphic', () => {
      jest.useFakeTimers()
      const createPolygonSymbolSpy = jest.spyOn(Draw.prototype, 'createPolygonSymbol')
      mockProvider.isDark = false
      drawInstance = new Draw(mockProvider, {})
      drawInstance.edit('vertex', 'polygon')
      expect(sketchViewModelMock.layer).toEqual(mockProvider.graphicsLayer)
      jest.runAllTimers()
      expect(sketchViewModelMock.create).toHaveBeenCalledWith('polygon', expect.any(Object))
      expect(createPolygonSymbolSpy).toHaveBeenCalledWith(false)
      jest.useRealTimers()
    })

    // it('should generate a new graphic from paddingBox if no existing graphic is found', () => {
    //   const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
    //   const getGraphicSpy = jest.spyOn(Draw.prototype, 'getGraphicFromElement')
    //   drawInstance = new Draw(mockProvider, {})
    //   const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
    //   getGraphicSpy.mockReturnValue(mockGraphic)
    //   drawInstance.edit('vertex', 'square')
    //   expect(editGraphicSpy).toHaveBeenCalledWith(mockGraphic)
    //   editGraphicSpy.mockRestore()
    //   getGraphicSpy.mockRestore()
    // })
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
    it('should clear all graphics from graphicsLayer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.cancel()
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })

    it('should reset sketchViewModel if active and set its layer to emptyLayer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.cancel()
      expect(drawInstance.sketchViewModel.reset).toHaveBeenCalled()
      expect(drawInstance.sketchViewModel.layer).toEqual(mockProvider.emptyLayer)
    })

    it('should reinstate the original graphic using addGraphic', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue(mockGraphic)
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      mockGraphic.attributes = { id: 'polygon' }
      mockGraphic.symbol = {}
      mockProvider.oGraphic = mockGraphic
      jest.spyOn(Draw.prototype, 'createGraphic').mockReturnValue(mockGraphic)
      drawInstance = new Draw(mockProvider, {})
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic').mockReturnValue(mockGraphic)
      drawInstance.oGraphic = mockGraphic
      drawInstance.cancel()
      expect(addGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
      addGraphicSpy.mockRestore()
    })
  })

  describe('finish()', () => {
    let mockGraphic

    beforeEach(() => {
      mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      mockGraphic.attributes = { id: 'square' }
      mockGraphic.clone = jest.fn().mockReturnValue({
        attributes: { id: 'square' },
        geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] },
        symbol: {}
      })
    })

    it('should call getGraphicFromElement and addGraphic if shape is circle or square', () => {
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance = new Draw(mockProvider, {})
      const getGraphicFromElementSpy = jest.spyOn(drawInstance, 'getGraphicFromElement').mockReturnValue(mockGraphic)
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.finish('square')
      expect(getGraphicFromElementSpy).toHaveBeenCalledWith(mockProvider.paddingBox, 'square')
      const mockElGraphic = getGraphicFromElementSpy.mock.results[0].value
      expect(addGraphicSpy).toHaveBeenCalledWith(mockElGraphic)
    })

    it('should reset sketchViewModel if active and set its layer to emptyLayer', () => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.cancel()
      expect(drawInstance.sketchViewModel.reset).toHaveBeenCalled()
      expect(drawInstance.sketchViewModel.layer).toEqual(mockProvider.emptyLayer)
    })

    it('should clone the finished graphic and store in oGraphic', () => {
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance = new Draw(mockProvider, {})
      drawInstance.finish('square')
      expect(drawInstance.oGraphic).toBeDefined()
    })

    it('should save the current zoom level from view.zoom', () => {
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      mockProvider.view.zoom = 15
      drawInstance = new Draw(mockProvider, {})
      drawInstance.finish('square')
      expect(drawInstance.originalZoom).toBe(15)
    })

    it('should return the feature representation using getFeature()', () => {
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance = new Draw(mockProvider, {})
      const getFeatureSpy = jest.spyOn(drawInstance, 'getFeature').mockReturnValue(mockGraphic)
      drawInstance.finish('square')
      expect(getFeatureSpy).toHaveBeenCalledWith(mockGraphic)
      getFeatureSpy.mockRestore()
    })
  })

  describe('reColour()', () => {
    let mockGraphic

    beforeEach(() => {
      mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: [[[0, 0], [1, 1], [2, 2]]] }
      mockGraphic.attributes = { id: 'square' }
      mockGraphic.clone = jest.fn().mockReturnValue({
        attributes: { id: 'square' },
        geometry: { rings: [[[0, 0], [1, 1], [2, 2]]] },
        symbol: {}
      })
    })

    it('should retrieve and update the first graphic from graphicsLayer', () => {
      mockProvider.graphicsLayer.remove = jest.fn()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      drawInstance = new Draw(mockProvider, { shape: 'square' })
      jest.spyOn(Draw.prototype, 'createGraphic').mockReturnValue(mockGraphic)
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.reColour()
      expect(addGraphicSpy).toHaveBeenCalledWith(mockGraphic)
      addGraphicSpy.mockRestore()
    })

    it('should not perform any action if no graphic exists', () => {
      mockProvider.graphicsLayer.graphics.items = []
      drawInstance = new Draw(mockProvider, { })
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.reColour()
      expect(addGraphicSpy).not.toHaveBeenCalled()
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
    it('should add the cloned graphic to graphicsLayer', () => {
      const drawInstance = new Draw(mockProvider, {})
      const addSpy = jest.spyOn(mockProvider.graphicsLayer, 'add')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.addGraphic(mockGraphic)

      expect(addSpy).toHaveBeenCalledWith(mockGraphic)
      addSpy.mockRestore()
    })

    it('should reorder graphicsLayer to zIndex = 99 on map', () => {
      const drawInstance = new Draw(mockProvider, {})
      const reorderSpy = jest.spyOn(mockProvider.map, 'reorder')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.addGraphic(mockGraphic)

      expect(reorderSpy).toHaveBeenCalledWith(mockProvider.graphicsLayer, 99)
      reorderSpy.mockRestore()
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
      // Prevent edit() from running in the constructor.
      jest.spyOn(Draw.prototype, 'edit').mockImplementation(() => {})
      drawInstance = new Draw(mockProvider, {})
      Draw.prototype.edit.mockRestore()
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

    it('should use default polygon stroke and fill settings from defaults', () => {
      const el = document.createElement('div')
      jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      const result = drawInstance.getGraphicFromElement(el)
      expect(result.symbol).toEqual({
        type: 'simple-fill',
        color: defaults.POLYGON_QUERY_FILL,
        outline: {
          color: defaults.POLYGON_QUERY_STROKE,
          width: defaults.POLYGON_QUERY_STROKE_WIDTH,
          cap: 'square'
        }
      })
    })

    it('should return the created Graphic instance', () => {
      const el = document.createElement('div')
      jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      const result = drawInstance.getGraphicFromElement(el)
      expect(result).toBeInstanceOf(Graphic)
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
