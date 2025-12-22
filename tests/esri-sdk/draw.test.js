import { Draw } from '../../src/js/provider/esri-sdk/draw'
import { defaults } from '../../src/js/provider/esri-sdk/constants'
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import { geometry } from '@turf/helpers'
import { cache } from 'react'

const areaOperatorSpy = jest.spyOn(require('@arcgis/core/geometry/operators/areaOperator.js'), 'execute').mockReturnValue(0.5)
jest.spyOn(require('@arcgis/core/geometry/operators/centroidOperator.js'), 'execute').mockReturnValue({
  x: 1,
  y: 1
})

const mockShapeArray = [[[0, 0], [0, 1], [1, 2], [0, 0]]]
const testShape = 'siteBoundary'
const mockGraphic = {
  attributes: {
    id: testShape
  },
  symbol: {},
  geometry: { rings: mockShapeArray, type: 'polygon', cache: {}, spatialReference: 27700, extent: { width: 1, height: 2 } }
}

const expectedSymbol = {
  type: 'simple-fill',
  color: undefined,
  outline: {
    color: '#d4351c',
    width: '2px',
    cap: 'square'
  }
}

jest.mock('@arcgis/core/Graphic', () => jest.fn().mockImplementation((definition = mockGraphic) => ({
  ...definition,
  clone: jest.fn().mockReturnValue({ ...definition })
})))

jest.mock('@arcgis/core/widgets/Sketch/SketchViewModel.js', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
    cancel: jest.fn(),
    activeTool: null,
    layer: {
      remove: jest.fn()
    }
  }))
})

describe('Draw Class', () => {
  let mockProvider // , drawInstance

  beforeEach(() => {
    jest.clearAllMocks()
    setupMockProvider()
  })

  function setupMockProvider () {
    const mockParent = document.createElement('div')
    mockParent.classList.add('fm-o-viewport')

    mockProvider = {
      draw: null,
      view: { goTo: jest.fn(), zoom: 10, toMap: jest.fn(() => ({ x: 100, y: 100 })) },
      graphicsLayer: {
        graphics: { items: [] },
        remove: jest.fn(),
        removeAll: jest.fn(),
        add: jest.fn((newLayer) => mockProvider.graphicsLayer.graphics.items.push(newLayer))
      },
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

  const createDrawInstance = (options = { }) => {
    options = { shape: testShape, ...options }
    if (options.addGraphic) {
      const existingGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      existingGraphic.clone = jest.fn().mockReturnValue(existingGraphic)
      mockProvider.graphicsLayer.graphics.items = [existingGraphic]
    }

    const feature = options.noFeature ? undefined : { geometry: { coordinates: mockShapeArray } }
    return new Draw(mockProvider, { feature, drawMode: 'default', shape: options.shape })
  }

  describe('Constructor', () => {
    it('should initialize Draw with provider reference', async () => {
      const drawInstance = new Draw(mockProvider, {})
      expect(mockProvider.draw).toBe(drawInstance)
    })

    it('should invoke createGraphic() with provided feature', async () => {
      const createSpy = jest.spyOn(Draw.prototype, 'createGraphic')
      createSpy.mockReturnValue(mockProvider.graphicsLayer)
      const addGraphicSpy = jest.spyOn(Draw.prototype, 'addGraphic')

      const drawInstance = createDrawInstance()

      expect(createSpy).toHaveBeenCalledWith(testShape, drawInstance.feature.geometry.coordinates)
      expect(addGraphicSpy).toHaveBeenCalledWith(mockProvider.graphicsLayer)
      createSpy.mockRestore()
    })
  })

  describe('findGraphic', () => {
    it('should return a graphic whose id matches the passed shape', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })

      const foundGraphic = drawInstance.findGraphic(testShape)
      expect(foundGraphic.attributes.id).toEqual(testShape)
    })

    it('should return undefined if there is no graphic whose id matches the passed shape', async () => {
      const drawInstance = createDrawInstance()
      mockProvider.graphicsLayer.graphics.items = []
      const foundGraphic = drawInstance.findGraphic(testShape)
      expect(foundGraphic).toBeUndefined()
    })
  })

  describe('add()', () => {
    it('should assign shape and drawMode', async () => {
      jest.useFakeTimers()
      const drawInstance = createDrawInstance()
      drawInstance.add('vertex', testShape)
      expect(drawInstance.shape).toEqual(testShape)
      expect(drawInstance.drawMode).toEqual('vertex')
      jest.runAllTimers()
      expect(drawInstance.sketchViewModel.create).toHaveBeenCalledWith(testShape, {
        drawMode: 'click',
        polygonSymbol: expectedSymbol
      })
    })

    it('should assign not call sketchViewModel.create if drawMode is not "vertex"', async () => {
      jest.useFakeTimers()
      const drawInstance = createDrawInstance()
      drawInstance.add('not-vertex', testShape)
      expect(drawInstance.shape).toEqual(testShape)
      expect(drawInstance.drawMode).toEqual('not-vertex')
      jest.runAllTimers()
      expect(drawInstance.sketchViewModel.create).not.toHaveBeenCalled()
    })
  })

  describe('edit()', () => {
    it('should assign shape and drawMode: vertex', async () => {
      jest.useFakeTimers()
      const drawInstance = createDrawInstance({ addGraphic: true })
      drawInstance.edit('vertex', testShape)
      expect(drawInstance.shape).toEqual(testShape)
      expect(drawInstance.drawMode).toEqual('vertex')
      jest.runAllTimers()
    })

    it('should zoom to the existing graphic when available', async () => {
      const drawInstance = createDrawInstance()
      drawInstance.edit('default')
      expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
    })

    it('should zoom to the existing graphic when available and drawMode is "frame" and this.originalZoom is set', async () => {
      const drawInstance = createDrawInstance()
      drawInstance.originalZoom = '10'
      drawInstance.edit('frame')
      expect(mockProvider.view.goTo).toHaveBeenNthCalledWith(1, { target: drawInstance.oGraphic, zoom: '10' })
    })

    it('should not zoom to the existing graphic when feature is not available', async () => {
      const drawInstance = createDrawInstance({ noFeature: true })
      drawInstance.edit('default')
      expect(mockProvider.view.goTo).not.toHaveBeenCalled()
    })

    it('should remove all graphics when edit is in "frame" mode"', () => {
      const drawInstance = createDrawInstance()
      drawInstance.edit('frame')
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })
  })

  // describe('start()', () => {
  //   it.skip('should zoom to the existing graphic when available', () => {
  //     drawInstance = new Draw(mockProvider, {})
  //     drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
  //     drawInstance.start('default')
  //     expect(mockProvider.view.goTo).toHaveBeenCalledWith({ target: drawInstance.oGraphic })
  //   })

  //   it.skip('should remove all graphics when started in "frame" mode"', () => {
  //     drawInstance = new Draw(mockProvider, {})
  //     drawInstance.start('frame')
  //     expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
  //   })

  //   it.skip('should initiate editGraphic() when mode is not "frame"', () => {
  //     const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
  //     drawInstance = new Draw(mockProvider, {})
  //     drawInstance.oGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
  //     drawInstance.start('default')
  //     expect(editGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
  //     editGraphicSpy.mockRestore()
  //   })
  // })

  // describe('edit()', () => {
  //   it.skip('should edit an existing graphic if available', () => {
  //     const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
  //     drawInstance = new Draw(mockProvider, {})
  //     const existingGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
  //     existingGraphic.clone = jest.fn().mockReturnValue(existingGraphic)
  //     mockProvider.graphicsLayer.graphics.items = [existingGraphic]
  //     drawInstance.edit()
  //     expect(editGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
  //     editGraphicSpy.mockRestore()
  //   })

  //   it.skip('should generate a new graphic from paddingBox if no existing graphic is found', () => {
  //     const editGraphicSpy = jest.spyOn(Draw.prototype, 'editGraphic')
  //     const getGraphicSpy = jest.spyOn(Draw.prototype, 'getGraphicFromElement')
  //     drawInstance = new Draw(mockProvider, {})
  //     const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
  //     getGraphicSpy.mockReturnValue(mockGraphic)
  //     drawInstance.edit()
  //     expect(editGraphicSpy).toHaveBeenCalledWith(mockGraphic)
  //     editGraphicSpy.mockRestore()
  //     getGraphicSpy.mockRestore()
  //   })
  // })

  describe('delete()', () => {
    it('should remove the stored oGraphic reference', () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      expect(drawInstance.oGraphic).not.toBeNull()
      drawInstance.delete()
      expect(drawInstance.oGraphic).toBeNull()
    })

    it('should remove all graphics from the graphicsLayer', () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      drawInstance.delete()
      expect(mockProvider.graphicsLayer.removeAll).toHaveBeenCalled()
    })
  })

  describe('cancel()', () => {
    it('should cancel sketchViewModel if active', () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      drawInstance.cancel()
      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it('should reinstate the original graphic using addGraphic()', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.cancel()
      expect(addGraphicSpy).toHaveBeenCalledWith(drawInstance.oGraphic)
    })

    it('should not call addGraphic() if there is not graphic / feature', async () => {
      const drawInstance = createDrawInstance({ noFeature: true })
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.cancel()
      expect(addGraphicSpy).not.toHaveBeenCalled()
    })
  })

  describe('getDimensions', () => {
    it('should return the dimensions of the polygon', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const dimensions = drawInstance.getDimensions()
      expect(dimensions).toEqual({
        area: 0.5,
        center: [1, 1],
        radius: 0.5,
        width: 1,
        geometry: mockGraphic.geometry
      })
    })
  })

  describe('handleCreate', () => {
    it('should update graphic attribute and symbol', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const mockEvent = {
        state: 'complete',
        graphic: {
          geometry: mockGraphic.geometry
        }
      }
      drawInstance.handleCreate(mockEvent)
      expect(mockEvent.graphic.attributes.id).toEqual(drawInstance.shape)
      expect(mockEvent.graphic.symbol).toEqual(expectedSymbol)
    })

    it('should update remove graphic if area is <= 0', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const mockEvent = {
        state: 'complete',
        graphic: {
          geometry: mockGraphic.geometry
        }
      }
      areaOperatorSpy.mockReturnValue(-1)
      drawInstance.handleCreate(mockEvent)
      expect(drawInstance.sketchViewModel.layer.remove).toHaveBeenCalledWith(mockEvent.graphic)
      expect(drawInstance.sketchViewModel.create).toHaveBeenCalledWith('polygon')
    })
  })

  describe('handleUpdateDelete', () => {
    const mockEvent = {
      undo: jest.fn(),
      cancel: jest.fn(),
      toolEventInfo: { type: 'reshape-stop' },
      graphics: [{
        geometry: { ...mockGraphic.geometry }
      }]
    }

    let handleUpdateDelete
    beforeEach(async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      // handleUpdateDelete is bound to sketchViewModel.on(['update', 'delete'],
      // so at run time, handleUpdateDelete's "this" refers to the event NOT the
      // instance of draw. So to test we bind the function to the mockEvent
      // - which has a mocked undo and cancel method.
      handleUpdateDelete = drawInstance.handleUpdateDelete.bind(mockEvent)
    })

    it('should call undo if area is <= 0 and toolEventInfo.type is "reshape-stop"', async () => {
      areaOperatorSpy.mockReturnValue(-1)
      handleUpdateDelete(mockEvent)
      expect(mockEvent.undo).toHaveBeenCalled()
    })

    it('should call undo if geometry.isSelfIntersecting and toolEventInfo.type is "reshape"', async () => {
      areaOperatorSpy.mockReturnValue(-1)
      mockEvent.toolEventInfo.type = 'reshape'
      mockEvent.graphics[0].geometry.isSelfIntersecting = true
      handleUpdateDelete(mockEvent)
      expect(mockEvent.undo).toHaveBeenCalled()
    })

    it('should call cancel if geometry.isSelfIntersecting and toolEventInfo.type is "move-start"', async () => {
      areaOperatorSpy.mockReturnValue(-1)
      mockEvent.toolEventInfo.type = 'move-start'
      handleUpdateDelete(mockEvent)
      expect(mockEvent.cancel).toHaveBeenCalled()
    })
  })

  describe('create()', () => {
    it.skip('should generate a new Graphic from the provided feature', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: mockShapeArray } }
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      jest.spyOn(drawInstance, 'getGraphicFromFeature').mockReturnValue(mockGraphic)
      drawInstance.create(feature)
      expect(drawInstance.getGraphicFromFeature).toHaveBeenCalledWith(feature)
    })

    it.skip('should store the cloned graphic in oGraphic', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: mockShapeArray } }
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

    it.skip('should add the generated graphic using addGraphic()', () => {
      drawInstance = new Draw(mockProvider, {})
      const feature = { geometry: { coordinates: mockShapeArray } }
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

    it('should retrieve the correct graphic in priority order', () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const result = drawInstance.finish(testShape)
      expect(result).toBeDefined()
      expect(result.geometry.coordinates).toEqual(mockGraphic.geometry.rings)
    })

    it('should retrieve a circle using getGraphicFromElement', () => {
      const shape = 'circle'
      const drawInstance = createDrawInstance({ addGraphic: true, shape })
      const result = drawInstance.finish(shape)
      expect(result).toBeDefined()
      expect(result.geometry.coordinates).toEqual(mockGraphic.geometry.rings)
    })

    it.skip('should use graphicsLayer graphic if finishEdit() returns null', () => {
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(null)
      const mockLayerGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockLayerGraphic.geometry = { rings: [[[3, 3], [4, 4], [5, 5]]] }
      mockProvider.graphicsLayer.graphics.items = [mockLayerGraphic]
      const result = drawInstance.finish()
      expect(result).toBeDefined()
      expect(drawInstance.finishEdit).toHaveBeenCalled()
      expect(result.geometry.coordinates).toEqual(mockLayerGraphic.geometry.rings)
    })

    it.skip('should default to paddingBox graphic if no other graphics exist', () => {
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(null)
      mockProvider.graphicsLayer.graphics.items = []
      const mockElementGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockElementGraphic.geometry = { rings: mockShapeArray }
      getGraphicSpy.mockReturnValue(mockElementGraphic)
      const result = drawInstance.finish()
      expect(result).toBeDefined()
      expect(drawInstance.finishEdit).toHaveBeenCalled()
      expect(getGraphicSpy).toHaveBeenCalled()
      expect(result.geometry.coordinates).toEqual(mockElementGraphic.geometry.rings)
    })

    it.skip('should cancel sketchViewModel after finishing', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: mockShapeArray }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.sketchViewModel.cancel).toHaveBeenCalled()
    })

    it.skip('should store the cloned finished graphic in oGraphic', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue(mockGraphic)
      mockGraphic.geometry = { rings: mockShapeArray }
      mockGraphic.symbol = {}
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.oGraphic).toBeDefined()
      expect(drawInstance.oGraphic.clone).toBeDefined()
    })

    it.skip('should save the current zoom level from view.zoom', () => {
      mockProvider.view.zoom = 15
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: mockShapeArray }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      drawInstance.finish()
      expect(drawInstance.originalZoom).toBe(15)
    })

    it.skip('should add the final graphic using addGraphic()', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.clone = jest.fn().mockReturnValue(mockGraphic)
      mockGraphic.geometry = { rings: mockShapeArray }
      mockGraphic.symbol = {}
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      drawInstance.finish()
      expect(addGraphicSpy).toHaveBeenCalledWith(expect.any(Object))
      addGraphicSpy.mockRestore()
    })

    it.skip('should return the feature representation using getFeature()', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: mockShapeArray }
      jest.spyOn(drawInstance, 'finishEdit').mockReturnValue(mockGraphic)
      const getFeatureSpy = jest.spyOn(drawInstance, 'getFeature')
      const result = drawInstance.finish()
      expect(getFeatureSpy).toHaveBeenCalledWith(mockGraphic)
      expect(result).toBeDefined()
      getFeatureSpy.mockRestore()
    })
  })

  describe('reColour()', () => {
    it('should retrieve and update the first graphic from graphicsLayer', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      addGraphicSpy.mockClear()

      drawInstance.reColour()

      // this assertion was failing because the clone spy method on the object was considered different
      // so this is a workaround to force it to be the same.
      const { clone } = addGraphicSpy.mock.calls[0][0]
      const expectedItem = { ...drawInstance.provider.graphicsLayer.graphics.items[0] }
      expect(addGraphicSpy).toHaveBeenCalledWith({
        ...expectedItem,
        geometry: { ...expectedItem.geometry, spatialReference: 27700, type: 'polygon', cache: undefined, extent: undefined },
        symbol: expectedSymbol,
        clone
      })
    })

    it('should not perform any action if no graphic exists', async () => {
      const drawInstance = createDrawInstance()
      mockProvider.graphicsLayer.graphics.items = []
      const addGraphicSpy = jest.spyOn(drawInstance, 'addGraphic')
      addGraphicSpy.mockClear()

      drawInstance.reColour(true)
      expect(addGraphicSpy).not.toHaveBeenCalled()
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

    it.skip('should create a SketchViewModel with the correct parameters', () => {
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

    it.skip('should store the created SketchViewModel instance', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(drawInstance.sketchViewModel).toBe(sketchViewModelMock)
    })

    it.skip('should register event listeners for update and delete events', () => {
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      expect(onSpy).toHaveBeenCalledWith(['update', 'delete'], expect.any(Function))
    })

    it.skip('should call update() on sketchViewModel with the provided graphic', async () => {
      jest.useFakeTimers()
      const graphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      drawInstance.editGraphic(graphic)
      jest.runAllTimers()
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('finishEdit()', () => {
    beforeEach(() => {
      drawInstance = new Draw(mockProvider, {})
      drawInstance.sketchViewModel = { complete: jest.fn() }
    })

    it.skip('should call complete() on sketchViewModel to finalize the edit', () => {
      drawInstance.finishEdit()
      expect(drawInstance.sketchViewModel.complete).toHaveBeenCalled()
    })

    it.skip('should remove the layer reference from sketchViewModel after completion', () => {
      drawInstance.finishEdit()
      expect(drawInstance.sketchViewModel.layer).toBeNull()
    })

    it.skip('should return the first available graphic from graphicsLayer', () => {
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockProvider.graphicsLayer.graphics.items = [mockGraphic]
      const result = drawInstance.finishEdit()
      expect(result).toBe(mockGraphic)
    })

    it.skip('should return undefined if no graphic exists in graphicsLayer', () => {
      mockProvider.graphicsLayer.graphics.items = []
      const result = drawInstance.finishEdit()
      expect(result).toBeUndefined()
    })
  })

  describe('getBounds()', () => {
    it.skip('should call getBoundingClientRect() to retrieve element dimensions', () => {
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

    it.skip('should find the closest .fm-o-viewport parent element', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockElement = document.createElement('div')
      const mockParent = document.createElement('div')
      mockParent.classList.add('fm-o-viewport')

      const closestSpy = jest.spyOn(mockElement, 'closest').mockReturnValue(mockParent)

      drawInstance.getBounds(mockElement)
      expect(closestSpy).toHaveBeenCalledWith('.fm-o-viewport')

      closestSpy.mockRestore()
    })

    it.skip('should compute northwest and southeast coordinates using view.toMap()', () => {
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

    it.skip('should return bounding box in the correct format [nw.x, nw.y, se.x, se.y]', () => {
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
    it.skip('should remove all existing graphics from graphicsLayer', () => {
      const drawInstance = new Draw(mockProvider, {})
      const removeAllSpy = jest.spyOn(mockProvider.graphicsLayer, 'removeAll')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()

      drawInstance.addGraphic(mockGraphic)

      expect(removeAllSpy).toHaveBeenCalled()
      removeAllSpy.mockRestore()
    })

    it.skip('should clone the given graphic', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {}, geometry: { rings: mockShapeArray } }

      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(mockGraphic.clone).toHaveBeenCalled()
    })

    it.skip('should set clone.symbol.color based on isDark setting', () => {
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

    it.skip('should add the cloned graphic to graphicsLayer', () => {
      const drawInstance = new Draw(mockProvider, {})
      const addSpy = jest.spyOn(mockProvider.graphicsLayer, 'add')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }
      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(addSpy).toHaveBeenCalledWith(clonedGraphic)
      addSpy.mockRestore()
    })

    it.skip('should call update() on sketchViewModel if an active tool exists', () => {
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

    it.skip('should reorder graphicsLayer to zIndex = 99 on map', () => {
      const drawInstance = new Draw(mockProvider, {})
      const reorderSpy = jest.spyOn(mockProvider.map, 'reorder')

      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {} }
      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      drawInstance.addGraphic(mockGraphic)

      expect(reorderSpy).toHaveBeenCalledWith(mockProvider.graphicsLayer, 99)
      reorderSpy.mockRestore()
    })

    it.skip('should return the cloned graphic', () => {
      const drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      const clonedGraphic = { symbol: {}, geometry: { rings: mockShapeArray } }

      mockGraphic.clone = jest.fn().mockReturnValue(clonedGraphic)

      const result = drawInstance.addGraphic(mockGraphic)

      expect(result).toBe(clonedGraphic)
    })
  })

  describe('getFeature()', () => {
    it.skip('should return an object with type "feature" and correct geometry', () => {
      drawInstance = new Draw(mockProvider, {})
      const mockGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      mockGraphic.geometry = { rings: mockShapeArray }

      const result = drawInstance.getFeature(mockGraphic)

      expect(result).toEqual({
        type: 'feature',
        geometry: {
          type: 'polygon',
          coordinates: mockGraphic.geometry.rings
        }
      })
    })

    it.skip('should correctly extract geometry.rings from the given graphic', () => {
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

    it.skip('should call getBounds(el) to retrieve bounding box', () => {
      const el = document.createElement('div')
      const getBoundsSpy = jest.spyOn(drawInstance, 'getBounds').mockReturnValue([0, 0, 1, 1])
      drawInstance.getGraphicFromElement(el)
      expect(getBoundsSpy).toHaveBeenCalledWith(el)
      getBoundsSpy.mockRestore()
    })

    it.skip('should create a polygon Graphic using the calculated bounds', () => {
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

    it.skip('should use default polygon stroke settings from defaults.POLYGON_QUERY_STROKE', () => {
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

    it.skip('should return the created Graphic instance', () => {
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

    it.skip('should extract rings from feature.geometry.coordinates', () => {
      const feature = { geometry: { coordinates: mockShapeArray } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic.geometry.rings).toEqual(feature.geometry.coordinates)
    })

    it.skip('should create a polygon Graphic with extracted coordinates', () => {
      const feature = { geometry: { coordinates: [[[3, 3], [4, 4], [5, 5]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic).toBeDefined()
      expect(graphic.geometry).toBeDefined()
      expect(graphic.geometry.type).toBe('polygon')
      expect(graphic.geometry.rings).toEqual(feature.geometry.coordinates)
      expect(graphic.geometry.spatialReference).toBe(27700)
    })

    it.skip('should use default polygon stroke settings from defaults.POLYGON_QUERY_STROKE', () => {
      const feature = { geometry: { coordinates: [[[6, 6], [7, 7], [8, 8]]] } }
      const graphic = drawInstance.getGraphicFromFeature(feature)
      expect(graphic.symbol).toEqual({
        type: 'simple-line',
        color: defaults.POLYGON_QUERY_STROKE,
        width: '2px',
        cap: 'square'
      })
    })

    it.skip('should return the created Graphic instance', () => {
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

    it.skip('should call undo() if toolEventInfo.type is "reshape-stop" and area <= 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'reshape-stop' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(0)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it.skip('should call undo() if toolEventInfo.type is "vertex-remove" and area <= 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'vertex-remove' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(-1)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it.skip('should not call undo() if toolEventInfo.type is "reshape-stop" and area > 0', () => {
      const fakeGeometry = {}
      const event = {
        toolEventInfo: { type: 'reshape-stop' },
        graphics: [{ geometry: fakeGeometry }]
      }
      jest.spyOn(geometryEngine, 'planarArea').mockReturnValue(5)
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).not.toHaveBeenCalled()
    })

    it.skip('should call undo() if toolEventInfo.type is "reshape" and geometry.isSelfIntersecting is true', () => {
      const fakeGeometry = { isSelfIntersecting: true }
      const event = {
        toolEventInfo: { type: 'reshape' },
        graphics: [{ geometry: fakeGeometry }]
      }
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).toHaveBeenCalled()
    })

    it.skip('should not call undo() if toolEventInfo.type is "reshape" and geometry.isSelfIntersecting is false', () => {
      const fakeGeometry = { isSelfIntersecting: false }
      const event = {
        toolEventInfo: { type: 'reshape' },
        graphics: [{ geometry: fakeGeometry }]
      }
      drawInstance.handleUpdateDelete(event)
      expect(drawInstance.undo).not.toHaveBeenCalled()
    })

    it.skip('should call cancel() if toolEventInfo.type is "move-start"', () => {
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
