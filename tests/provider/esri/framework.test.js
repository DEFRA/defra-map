import Provider from '../../../src/js/provider/esri/provider.js'
import { handleBaseTileLayerLoaded, handleMoveStart, handleStationary, handleStyleChange } from '../../../src/js/provider/esri/events.js'
import { debounce } from '../../../src/js/lib/debounce.js'
import { getFocusPadding } from '../../../src/js/lib/viewport.js'
import { getDetail } from '../../../src/js/provider/esri/query.js'

// Constants for testing
const TEST_COORDINATES = [50, 50]
const TEST_BOUNDS = [0, 0, 100, 100]
const TEST_CENTER = [50, 50]
const TEST_ZOOM = 10
const TEST_MIN_ZOOM = 5
const TEST_MAX_ZOOM = 15
const TEST_PADDING = { top: 10, left: 10, right: 10, bottom: 10 }
const TEST_POINT = { x: 100, y: 200 }

jest.mock('../../../src/js/provider/esri/events', () => ({
  handleBaseTileLayerLoaded: jest.fn(),
  handleStyleChange: jest.fn(),
  handleMoveStart: jest.fn(),
  handleMove: jest.fn(),
  handleStationary: jest.fn()
}))

jest.mock('../../../src/js/provider/esri/query.js', () => ({
  getDetail: jest.fn().mockResolvedValue({
    bounds: TEST_BOUNDS,
    TEST_CENTER,
    zoom: TEST_ZOOM,
    resultType: 'pixel',
    coord: TEST_COORDINATES,
    features: { items: [], TEST_COORDINATES, resultType: 'pixel' },
    place: null
  })
}))

jest.mock('@arcgis/core/geometry/Point.js', () => ({
  __esModule: true,
  default: class Point {
    constructor ({ x, y, spatialReference }) {
      this.x = x
      this.y = y
      this.spatialReference = spatialReference
    }
  }
}))

jest.mock('../../../src/js/provider/esri/draw.js', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../../../src/js/lib/debounce.js', () => ({
  debounce: jest.fn(fn => fn)
}))

jest.mock('../../../src/js/lib/viewport.js', () => ({
  ...jest.requireActual('../../../src/js/lib/viewport.js'),
  getFocusPadding: jest.fn(() => (TEST_PADDING))
}))

jest.mock('@arcgis/core/layers/VectorTileLayer', () => {
  return jest.fn().mockImplementation(() => ({
    watch: jest.fn(),
    load: jest.fn().mockResolvedValue()
  }))
})

jest.mock('../../../src/js/provider/esri/marker.js', () => ({
  ...jest.requireActual('../../../src/js/provider/esri/marker.js'),
  targetMarkerGraphic: jest.fn((coord, isDark, hasData) => ({
    geometry: { type: 'point', x: coord[0], y: coord[1], spatialReference: 27700 },
    symbol: { color: isDark ? '#ffffff' : '#0b0c0c', type: 'simple-marker', outline: { color: isDark ? '#ffffff' : '#0b0c0c', width: 0 } }
  }))
}))

jest.mock('@arcgis/core/views/MapView', () => {
  return jest.fn().mockImplementation(() => ({
    when: jest.fn().mockResolvedValue(),
    goTo: jest.fn(),
    destroy: jest.fn(),
    container: { appendChild: jest.fn(), removeChild: jest.fn() },
    on: jest.fn(),
    emit: jest.fn()
  }))
})

describe('ESRIProvider', () => {
  let provider
  let mockSetupEsriConfig
  let modules
  let mockDraw

  const MockMapView = jest.fn().mockImplementation(() => {
    const handlers = {}
    return {
      on: jest.fn((eventName, handler) => {
        handlers[eventName] = handler
        if (eventName === 'drag') {
          handler({ action: 'start' })
        }
      }),
      goTo: jest.fn().mockResolvedValue(),
      toScreen: jest.fn(),
      toMap: jest.fn(),
      constraints: {},
      container: { appendChild: jest.fn(), removeChild: jest.fn() },
      padding: {},
      ui: { components: [] },
      emit: jest.fn()
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()

    jest.mock('@arcgis/core/Graphic.js', () => ({
      __esModule: true,
      default: class Graphic {
        constructor (options) {
          Object.assign(this, options)
        }
      }
    }))

    mockDraw = jest.fn()

    mockDraw.mockClear()

    jest.mock('../../../src/js/provider/esri/draw.js', () => ({
      __esModule: true,
      default: mockDraw
    }), { virtual: true })

    const mockExtent = jest.fn().mockImplementation(({ xmin, ymin, xmax, ymax }) => ({
      xmin,
      ymin,
      xmax,
      ymax
    }))

    jest.mock('@arcgis/core/geometry/Extent.js', () => ({
      __esModule: true,
      default: mockExtent
    }))

    global.navigator.geolocation = {
      getCurrentPosition: jest.fn()
    }

    mockSetupEsriConfig = jest.fn()
    global.document = {
      createElement: jest.fn(() => ({ classList: { add: jest.fn() } }))
    }
    provider = new Provider({
      transformGeocodeRequest: jest.fn(),
      setupEsriConfig: mockSetupEsriConfig
    })

    provider.map = {
      reorder: jest.fn()
    }

    provider.graphicsLayer = {
      add: jest.fn(),
      addMany: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn()
    }

    // provider.getNearest = jest.fn().mockResolvedValue('mockPlace')

    global.defaults = {
      PRECISION: 6
    }

    provider.isDark = false

    provider.view = new (require('@arcgis/core/views/MapView'))()

    provider.view = {
      center: TEST_POINT,
      padding: {},
      toScreen: jest.fn(({ x, y }) => ({ x: x + 50, y: y + 100 })),
      toMap: jest.fn(({ x, y }) => ({ x: x - 50, y: y - 100 })),
      zoom: 5,
      constraints: {
        maxZoom: 0,
        minZoom: 0
      },
      animation: {
        destroy: jest.fn()
      },
      stationary: true,
      goTo: jest.fn().mockResolvedValue()
    }

    provider.view.container = { appendChild: jest.fn(), removeChild: jest.fn() }

    provider.paddingBox = TEST_PADDING
    provider.baseTileLayer = {
      loadStyle: jest.fn().mockResolvedValue()
    }

    // Define modules
    modules = [
      { default: jest.fn() }, // esriConfig
      { default: jest.fn() }, // EsriMap
      { default: MockMapView }, // MapView
      { default: jest.fn() }, // Extent
      { default: jest.fn() }, // Point
      {
        default: jest.fn().mockImplementation(() => ({
          watch: jest.fn(), // Ensure VectorTileLayer has a watch method
          load: jest.fn().mockResolvedValue()
        }))
      }, // VectorTileLayer
      { default: jest.fn() }, // FeatureLayer
      { default: jest.fn() }, // GraphicsLayer
      {
        default: {
          create: jest.fn().mockImplementation(({ spatialReference }) => ({
            lods: [
              { level: 0, scale: 1000000, resolution: 100 },
              { level: 1, scale: 500000, resolution: 50 },
              { level: 2, scale: 250000, resolution: 25 }
            ]
          }))
        }
      }, // TileInfo
      { when: jest.fn(), watch: jest.fn() } // reactiveUtils
    ]

    const testContainer = document.createElement('div')
    testContainer.id = 'test-container'
    const viewSurface = document.createElement('div')
    viewSurface.classList.add('esri-view-surface')
    testContainer.appendChild(viewSurface)

    document.body.appendChild(testContainer)

    global.navigator.geolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    }

    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('Initialization', () => {
    it('should initialize with default properties', () => {
      expect(provider.srid).toBe(27700)
      expect(provider.isUserInitiated).toBe(false)
      expect(provider.isLoaded).toBe(false)
    })

    it('should set map, view, and layers during addMap', async () => {
      const container = document.getElementById('test-container')

      const options = {
        container,
        paddingBox: {},
        bounds: TEST_BOUNDS,
        maxExtent: TEST_BOUNDS,
        TEST_CENTER,
        zoom: TEST_ZOOM,
        minZoom: TEST_MIN_ZOOM,
        maxZoon: TEST_MAX_ZOOM,
        style: { url: 'test-url', name: 'default' },
        locationLayers: [],
        callBack: jest.fn()
      }

      await provider.addMap(modules, options)

      const reactiveWhen = modules[9].when
      const reactiveWatch = modules[9].watch
      const view = provider.view
      const baseTileLayer = provider.baseTileLayer
      baseTileLayer.loaded = true
      view.ready = true

      // Mock the reactiveWatch an reactiveWhen callback
      const whenCallback = reactiveWhen.mock.calls[0][1]
      const watchCallback = reactiveWatch.mock.calls[0][1]

      // Simulate view ready and then change to trigger move start
      whenCallback([view.ready])
      watchCallback([baseTileLayer.loaded])

      expect(handleBaseTileLayerLoaded).toHaveBeenCalled()
      expect(provider.map).toBeDefined()
      expect(provider.view).toBeDefined()
      expect(provider.baseTileLayer).toBeDefined()
      expect(provider.graphicsLayer).toBeDefined()
    })

    it('should call setupEsriConfig during initialization', async () => {
      const container = document.getElementById('test-container')

      const options = {
        container,
        paddingBox: {},
        bounds: TEST_BOUNDS,
        maxExtent: TEST_BOUNDS,
        TEST_CENTER,
        zoom: TEST_ZOOM,
        minZoom: TEST_MIN_ZOOM,
        maxZoon: TEST_MAX_ZOOM,
        style: { url: 'test-url', name: 'default' },
        locationLayers: [],
        callBack: jest.fn()
      }

      await provider.init(options)

      expect(provider.setupEsriConfig).toBeDefined()
      expect(provider.setupEsriConfig).toBe(mockSetupEsriConfig)
      expect(container.querySelector('.esri-view-surface')).not.toBeNull()
    })
  })

  describe('Map Operations', () => {
    it('should handle user-initiated map movement', async () => {
      const container = document.getElementById('test-container')

      const options = {
        container,
        paddingBox: {},
        bounds: TEST_BOUNDS,
        maxExtent: TEST_BOUNDS,
        TEST_CENTER,
        zoom: TEST_ZOOM,
        minZoom: TEST_MIN_ZOOM,
        maxZoon: TEST_MAX_ZOOM,
        style: { url: 'test-url', name: 'default' },
        locationLayers: [],
        callBack: jest.fn()
      }
      await provider.addMap(modules, options)
      provider.view.emit('drag', { action: 'start' })
      expect(provider.isUserInitiated).toBe(true)
    })

    it('should handle move start correctly', async () => {
      const container = document.getElementById('test-container')

      const options = {
        container,
        paddingBox: {},
        bounds: TEST_BOUNDS,
        maxExtent: TEST_BOUNDS,
        TEST_CENTER,
        zoom: TEST_ZOOM,
        minZoom: TEST_MIN_ZOOM,
        maxZoon: TEST_MAX_ZOOM,
        style: { url: 'test-url', name: 'default' },
        locationLayers: [],
        callBack: jest.fn()
      }

      await provider.addMap(modules, options)

      const reactiveWhen = modules[9].when
      const reactiveWatch = modules[9].watch
      const view = provider.view
      view.ready = true
      view.center = { x: 0, y: 0 }
      view.zoom = 6

      // Mock the reactiveWhen and reactiveWatch callbacks
      const whenCallback = reactiveWhen.mock.calls[0][1]

      // Set reactive when property
      whenCallback([view.ready])

      const watchCallback = reactiveWatch.mock.calls[2][1]

      const oldZoom = 6
      const oldX = 0
      const oldY = 0
      const newZoom = 8
      const newX = 1
      const newY = 1

      // Set reactive watch property
      watchCallback([newZoom, newX, newY], [oldZoom, oldX, oldY])

      expect(handleMoveStart).toHaveBeenCalled()
    })

    it('should call debounceStationary when view becomes stationary', async () => {
      const container = document.createElement('div')
      container.id = 'test-container'
      document.body.appendChild(container)

      // Create and append the .esri-view-surface element
      const viewSurface = document.createElement('div')
      viewSurface.classList.add('esri-view-surface')
      container.appendChild(viewSurface)

      const options = {
        container,
        paddingBox: {},
        bounds: TEST_BOUNDS,
        maxExtent: TEST_BOUNDS,
        TEST_CENTER,
        zoom: TEST_ZOOM,
        minZoom: 5,
        maxZoon: TEST_MAX_ZOOM,
        style: { url: 'test-url', name: 'default' },
        locationLayers: [],
        callBack: jest.fn(),
        isStationary: true
      }

      await provider.addMap(modules, options)

      const reactiveWatch = modules[9].watch
      const view = provider.view
      view.stationary = true
      view.updating = false

      // Mock the reactiveWatch callback
      const watchCallback = reactiveWatch.mock.calls[1][1]

      // Simulate view becoming stationary
      watchCallback([view.stationary, view.updating]) // stationary is true

      expect(debounce).toHaveBeenCalled()
      expect(handleStationary).toHaveBeenCalled()
    })
  })

  describe('Map Interaction', () => {
    it('should set target marker', (done) => {
      const coord = [50, 50]
      const hasData = true
      const isVisible = true

      provider.setTargetMarker(coord, hasData, isVisible)

      setTimeout(() => {
        try {
          expect(provider.targetMarker).toBeDefined()
          done()
        } catch (error) {
          done(error)
        }
      })
    })

    it('should remove target marker', () => {
    // Create a mock marker object
      const mockHalo = { remove: jest.fn() }
      const mockFill = { remove: jest.fn() }

      // Set up the provider with the mock marker
      provider.targetMarker = [mockHalo, mockFill]
      provider.graphicsLayer = { remove: jest.fn() }

      // Call the method
      provider.removeTargetMarker()

      // Assert that graphicsLayer.remove was called with the mock marker
      expect(provider.graphicsLayer.remove).toHaveBeenCalledWith(mockHalo)
      expect(provider.graphicsLayer.remove).toHaveBeenCalledWith(mockFill)
      expect(provider.targetMarker).toBeNull()
    })

    it('should return a Point object with correct coordinates and spatial reference', () => {
      const Point = jest.fn().mockImplementation(({ x, y, spatialReference }) => ({
        x,
        y,
        spatialReference
      }))
      const coords = [100, 200]
      const result = provider.getPoint(Point, coords)

      expect(result).toEqual({
        x: 100,
        y: 200,
        spatialReference: { wkid: 27700 }
      })
      expect(Point).toHaveBeenCalledWith({
        x: 100,
        y: 200,
        spatialReference: { wkid: 27700 }
      })
    })

    it('should return null if coords is null', () => {
      const Point = jest.fn()
      const result = provider.getPoint(Point, null)
      expect(result).toBeNull()
      expect(Point).not.toHaveBeenCalled()
    })

    it('should return pixel coordinates rounded to the nearest integer', () => {
      const coord = [50, 100]
      const result = provider.getPixel(coord)
      expect(result).toEqual([100, 200])
      expect(provider.view.toScreen).toHaveBeenCalledWith({ x: 50, y: 100 })
    })

    it('should pan the view by the specified offset', async () => {
      const offset = [50, 100]
      provider.panBy(offset)

      expect(provider.view.toScreen).toHaveBeenCalledWith(provider.view.center)
      expect(provider.view.toMap).toHaveBeenCalledWith({ x: 200, y: 400 })
      expect(provider.view.goTo).toHaveBeenCalledWith({ center: { x: 150, y: 300 }, duration: 500 })
      expect(provider.isUserInitiated).toBe(true)
    })

    it('should handle panBy with different isUserInitiated values', () => {
      provider.panBy([50, 100], false)
      expect(provider.isUserInitiated).toBe(false)
    })

    it('should set isUserInitiated to the provided value', async () => {
      const offset = [50, 100]
      provider.panBy(offset, false)

      expect(provider.isUserInitiated).toBe(false)
    })

    it('should pan to the specified coordinates', async () => {
      const coord = [50, 100]
      provider.panTo(coord)

      expect(provider.view.goTo).toHaveBeenCalledWith({ target: { x: coord[0], y: coord[1] }, duration: 500 })
    })

    it('should zoom in by one level', async () => {
      provider.zoomIn()

      expect(provider.view.animation.destroy).toHaveBeenCalled()
      expect(provider.isUserInitiated).toBe(true)
      expect(provider.view.goTo).toHaveBeenCalledWith({ zoom: 6, duration: 500 })
    })

    it('should zoom out by one level', async () => {
      provider.zoomOut()

      expect(provider.view.animation.destroy).toHaveBeenCalled()
      expect(provider.isUserInitiated).toBe(true)
      expect(provider.view.goTo).toHaveBeenCalledWith({ zoom: 4, duration: 500 })
    })

    it('should set the style and zoom constraints', async () => {
      const style = { url: 'test-url', name: 'dark' }
      const minZoom = 5
      const maxZoom = 15

      await provider.setStyle(style, minZoom, maxZoom)

      expect(provider.view.constraints.maxZoom).toBe(maxZoom)
      expect(provider.view.constraints.minZoom).toBe(minZoom)
      expect(provider.style).toBe(style)
      expect(provider.isDark).toBe(true)
      expect(provider.baseTileLayer.loadStyle).toHaveBeenCalledWith(style.url)
      expect(handleStyleChange).toHaveBeenCalled()
    })

    it('should handle setPadding with undefined view', async () => {
      provider.view = undefined

      const coord = [50, 100]
      const isAnimate = true

      await provider.setPadding(coord, isAnimate)

      expect(provider.view).toBeUndefined()
    })

    it('should handle setStyle with non-dark style', async () => {
      const style = { url: 'test-url', name: 'light' }
      const minZoom = 5
      const maxZoom = 15

      await provider.setStyle(style, minZoom, maxZoom)

      expect(provider.isDark).toBe(false)
    })

    it('should set the padding and go to the specified coordinates', async () => {
      jest.useFakeTimers()

      // Ensure goTo returns a Promise
      provider.view.goTo = jest.fn().mockResolvedValue()

      const coord = [50, 100]
      const isAnimate = true
      const padding = { top: 20, left: 20, right: 20, bottom: 20 }

      getFocusPadding.mockReturnValue(padding)

      // Use Promise.all to handle both the async setPadding and timers
      await Promise.all([
        provider.setPadding(coord, isAnimate),
        jest.runAllTimers()
      ])

      expect(provider.view.padding).toBe(padding)
      expect(getFocusPadding).toHaveBeenCalledWith(provider.paddingBox, 1)
      expect(provider.isUserInitiated).toBe(false)
      expect(provider.view.goTo).toHaveBeenCalledWith({
        target: expect.objectContaining({
          x: 50,
          y: 100,
          spatialReference: 27700
        })
      }, {
        animation: isAnimate
      })

      jest.useRealTimers()
    })

    it('should set the padding without coordinates', async () => {
      const padding = { top: 20, left: 20, right: 20, bottom: 20 }

      getFocusPadding.mockReturnValue(padding)

      provider.setPadding(null, false)

      expect(provider.view.padding).toBe(padding)
      expect(getFocusPadding).toHaveBeenCalledWith(provider.paddingBox, 1)
      expect(provider.isUserInitiated).toBe(false)
      expect(provider.view.goTo).not.toHaveBeenCalled()
    })

    it('should handle goTo errors when setting padding', async () => {
    // Mock console.log to verify error logging
      const consoleSpy = jest.spyOn(console, 'log')

      // Mock the error that goTo will throw
      const error = new Error('Failed to set padding')
      provider.view.goTo = jest.fn().mockRejectedValue(error)

      // Mock the Point module import
      const mockPoint = jest.fn()
      jest.mock('@arcgis/core/geometry/Point.js', () => ({
        default: mockPoint
      }))

      const coord = [530000, 180000]
      await provider.setPadding(coord, true)

      // Wait for any promises to resolve
      await new Promise(process.nextTick)

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(error)

      // Clean up
      consoleSpy.mockRestore()
    })

    it('should call console.log when setSize is called', () => {
    // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log')

      // Call the method
      provider.setSize()

      // Assert console.log was called with 'setSize'
      expect(consoleSpy).toHaveBeenCalledWith('setSize')

      // Clean up the spy
      consoleSpy.mockRestore()
    })

    it('should fit the map to the specified bounds', async () => {
    // Ensure view.goTo returns a Promise
      provider.view.goTo = jest.fn().mockResolvedValue()

      const bounds = [0, 10, 100, 110] // [xmin, ymin, xmax, ymax]

      // Call fitBounds and wait for the dynamic import to resolve
      await provider.fitBounds(bounds)

      // Wait for any pending promises to resolve
      await new Promise(process.nextTick)

      // Verify goTo was called with the correct Extent
      expect(provider.view.goTo).toHaveBeenCalledWith(
        expect.objectContaining({
          xmin: bounds[0],
          ymin: bounds[1],
          xmax: bounds[2],
          ymax: bounds[3]
        }),
        expect.objectContaining({
          duration: 500
        })
      )
    })

    // Test error handling
    it('should handle errors when fitting bounds', async () => {
    // Mock console.log to verify error logging
      const consoleSpy = jest.spyOn(console, 'log')

      // Make view.goTo reject with an error
      const error = new Error('Failed to fit bounds')
      provider.view.goTo = jest.fn().mockRejectedValue(error)

      const bounds = [0, 10, 100, 110]

      // Call fitBounds and wait for it to complete
      await provider.fitBounds(bounds)

      // Wait for any pending promises to resolve
      await new Promise(process.nextTick)

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(error)

      // Clean up
      consoleSpy.mockRestore()
    })

    it('should set center and zoom level', async () => {
      const coord = [50, 100]
      const zoom = 12

      await provider.setCentre(coord, zoom)

      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: coord,
        zoom,
        duration: 500
      })
    })

    it('should handle invalid coordinates', async () => {
      await provider.setCentre(null, 12)
      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: null,
        zoom: 12,
        duration: 500
      })

      await provider.setCentre(undefined, 12)
      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: undefined,
        zoom: 12,
        duration: 500
      })

      await provider.setCentre([], 12)
      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: [],
        zoom: 12,
        duration: 500
      })
    })

    it('should handle setCentre without zoom', async () => {
      await provider.setCentre(TEST_CENTER)
      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: TEST_CENTER,
        zoom: undefined,
        duration: 500
      })
    })

    it('should handle errors when setting center', async () => {
    // Mock console.log to verify error logging
      const consoleSpy = jest.spyOn(console, 'log')

      // Make view.goTo reject with an error
      const error = new Error('Failed to set center')
      provider.view.goTo = jest.fn().mockRejectedValue(error)

      const coord = [50, 100]
      const zoom = 12

      await provider.setCentre(coord, zoom)

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(error)

      // Clean up
      consoleSpy.mockRestore()
    })

    it('should handle setting center without zoom', async () => {
      const coord = [50, 100]

      await provider.setCentre(coord)

      expect(provider.view.goTo).toHaveBeenCalledWith({
        center: coord,
        zoom: undefined,
        duration: 500
      })
    })

    it('should pass through invalid coordinates', async () => {
      await provider.setCentre(null, 12)
      await provider.setCentre(undefined, 12)
      await provider.setCentre([], 12)

      expect(provider.view.goTo).toHaveBeenCalledTimes(3)
      expect(provider.view.goTo).toHaveBeenNthCalledWith(1, {
        center: null,
        zoom: 12,
        duration: 500
      })
      expect(provider.view.goTo).toHaveBeenNthCalledWith(2, {
        center: undefined,
        zoom: 12,
        duration: 500
      })
      expect(provider.view.goTo).toHaveBeenNthCalledWith(3, {
        center: [],
        zoom: 12,
        duration: 500
      })
    })

    it('should initialize Draw and remove target marker', async () => {
    // Spy on the actual removeTargetMarker method
      jest.spyOn(provider, 'removeTargetMarker')

      const options = {
        type: 'polygon',
        color: '#ff0000'
      }

      provider.initDraw(options)

      // Wait for dynamic import to resolve
      await new Promise(process.nextTick)

      expect(provider.removeTargetMarker).toHaveBeenCalled()
      expect(mockDraw).toHaveBeenCalledWith(provider, options)
    })

    it('should handle setTargetMarker with null coordinates', (done) => {
      provider.setTargetMarker(null, true, true)

      setTimeout(() => {
        try {
          expect(provider.targetMarker).toBeUndefined()
          done()
        } catch (error) {
          done(error)
        }
      })
    })

    it('should handle removeTargetMarker when no marker exists', () => {
      provider.targetMarker = null
      provider.removeTargetMarker()
      expect(provider.graphicsLayer.remove).not.toHaveBeenCalled()
    })

    it('should query point and dispatch mapquery event', async () => {
      const point = TEST_POINT
      const mockDetail = {
        coord: [100, 200],
        features: { resultType: 'pixel', items: [] }
      }

      getDetail.mockResolvedValue(mockDetail)

      // Spy on dispatchEvent
      const dispatchEventSpy = jest.spyOn(provider, 'dispatchEvent')

      await provider.queryPoint(point)

      expect(getDetail).toHaveBeenCalledWith(point)
      expect(dispatchEventSpy).toHaveBeenCalledWith(new CustomEvent('mapquery', {
        detail: {
          resultType: mockDetail.features.resultType,
          ...mockDetail
        }
      }))
    })

    it('should call success callback with coordinates and place', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      }

      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition)
      })

      const successCallback = jest.fn()
      const errorCallback = jest.fn()

      await provider.getGeoLocation(successCallback, errorCallback)

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: false })
      expect(successCallback).toHaveBeenCalledWith([-0.1278, 51.5074], null)
      expect(errorCallback).not.toHaveBeenCalled()
    })

    it('should call error callback on geolocation error', async () => {
      const mockError = new Error('Geolocation error')

      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(mockError)
      })

      const successCallback = jest.fn()
      const errorCallback = jest.fn()

      await provider.getGeoLocation(successCallback, errorCallback)

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: false })
      expect(successCallback).not.toHaveBeenCalled()
      expect(errorCallback).toHaveBeenCalledWith(mockError)
    })

    // it('should call getNearest with the correct arguments and return the response', async () => {
    //   const coord = [100, 200]
    //   const response = await provider.getNearest(coord)

    //   expect(provider.getNearest).toHaveBeenCalledWith(coord)
    //   expect(response).toBe('mockPlace')
    // })
  })
})
