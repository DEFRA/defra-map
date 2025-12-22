import { Draw } from '../../src/js/provider/esri-sdk/draw'

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
    options = { shape: testShape, drawMode: 'default', ...options }
    if (options.addGraphic) {
      const existingGraphic = new (jest.requireMock('@arcgis/core/Graphic'))()
      existingGraphic.clone = jest.fn().mockReturnValue(existingGraphic)
      mockProvider.graphicsLayer.graphics.items = [existingGraphic]
    }

    const feature = options.noFeature ? undefined : { geometry: { coordinates: mockShapeArray } }
    return new Draw(mockProvider, { feature, drawMode: options.drawMode, shape: options.shape })
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

    it('should return an empty dimensions object if there is no currentGraphic', async () => {
      const drawInstance = createDrawInstance({ noFeature: true })
      const dimensions = drawInstance.getDimensions()
      expect(dimensions).toEqual({})
    })

    it('should return an empty dimensions object if there is no currentGraphic and drawMode is "frame"', async () => {
      const drawInstance = createDrawInstance({ noFeature: true, drawMode: 'frame' })
      jest.spyOn(drawInstance, 'getGraphicFromElement').mockReturnValue({ geometry: {} })
      const dimensions = drawInstance.getDimensions()
      expect(dimensions).toEqual({})
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

    it('should do nothing if state is not complete', async () => {
      const drawInstance = createDrawInstance({ addGraphic: true })
      const mockEvent = {
        state: 'not-complete',
        graphic: {
          geometry: mockGraphic.geometry
        }
      }
      const mockEventString = JSON.stringify(mockEvent)
      drawInstance.handleCreate(mockEvent)
      expect(mockEventString).toEqual(JSON.stringify(mockEvent))
    })
  })

  describe('finish()', () => {
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

    it('should not  call undo if area is > 0 and toolEventInfo.type is "reshape-stop"', async () => {
      areaOperatorSpy.mockReturnValue(10)
      handleUpdateDelete(mockEvent)
      expect(mockEvent.undo).not.toHaveBeenCalled()
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

  describe('createPolygonSymbol', () => {
    it('should return the expected values when drawMode is not dark', async () => {
      const drawInstance = createDrawInstance()

      expect(drawInstance.createPolygonSymbol()).toEqual(expectedSymbol)
    })

    it('should return the expected values when drawMode is dark', async () => {
      const drawInstance = createDrawInstance()

      expect(drawInstance.createPolygonSymbol(true)).toEqual({ ...expectedSymbol, outline: { ...expectedSymbol.outline, color: '#ffffff' } })
    })
  })
})
