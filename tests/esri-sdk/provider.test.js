import Provider from '../../src/js/provider/esri-sdk/provider.js'
import { capabilities } from '../../src/js/lib/capabilities.js'
// import { defaults } from '../../src/js/provider/esri-sdk/constants.js'
// import { targetMarkerGraphic } from '../../src/js/provider/esri-sdk/marker.js'
// import { defaults as storeDefaults } from '../../src/js/store/constants.js'

jest.mock('../../src/js/provider/esri-sdk/events', () => ({
  handleBaseTileLayerLoaded: jest.fn(),
  handleStyleChange: jest.fn(),
  handleMoveStart: jest.fn(),
  handleStationary: jest.fn()
}))

jest.mock('../../src/js/provider/esri-sdk/query.js', () => ({
  getDetail: jest.fn().mockResolvedValue({
    bounds: [0, 0, 100, 100],
    center: [50, 50],
    zoom: 10,
    resultType: 'pixel',
    coord: [50, 50],
    features: { items: [], coord: [50, 50], resultType: 'pixel' },
    place: null
  })
}))

jest.mock('../../src/js/lib/debounce.js', () => ({
  debounce: jest.fn(fn => fn)
}))

jest.mock('../../src/js/lib/viewport.js', () => ({
  ...jest.requireActual('../../src/js/lib/viewport.js'),
  getFocusPadding: jest.fn(() => ({ top: 10, left: 10, right: 10, bottom: 10 }))
}))

jest.mock('../../src/js/lib/capabilities.js', () => ({
  capabilities: {
    esri: {}
  }
}))

jest.mock('@arcgis/core/layers/VectorTileLayer', () => {
  return jest.fn().mockImplementation(() => ({
    watch: jest.fn(),
    load: jest.fn().mockResolvedValue()
  }))
})

jest.mock('../../src/js/provider/esri-sdk/marker.js', () => ({
  ...jest.requireActual('../../src/js/provider/esri-sdk/marker.js'),
  targetMarkerGraphic: jest.fn((coord, isDark, hasData) => ({
    geometry: { type: 'point', x: coord[0], y: coord[1], spatialReference: 27700 },
    symbol: { color: isDark ? '#ffffff' : '#0b0c0c', type: 'simple-marker' }
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

describe('Provider', () => {
  let provider
  let mockTokenCallback
  let mockInterceptorsCallback
  let modules
  // Mock the MapView class
  const MockMapView = jest.fn().mockImplementation(() => {
    const handlers = {}
    return {
      on: jest.fn((eventName, handler) => {
        handlers[eventName] = handler
        // Immediately execute the handler for 'drag' event
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

    mockTokenCallback = jest.fn().mockResolvedValue({ token: 'test-token' })
    global.document = {
      createElement: jest.fn(() => ({ classList: { add: jest.fn() } }))
    }
    mockInterceptorsCallback = jest.fn().mockReturnValue([])
    provider = new Provider({
      transformSearchRequest: jest.fn(),
      tokenCallback: mockTokenCallback,
      interceptorsCallback: mockInterceptorsCallback
    })

    console.log('provider tokenCallback:', provider.tokenCallback)

    // Ensure provider.view is properly mocked
    provider.view = new (require('@arcgis/core/views/MapView'))()

    // Manually set a fake container
    provider.view.container = { appendChild: jest.fn(), removeChild: jest.fn() }

    // Define modules for all tests
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
      { watch: jest.fn() } // reactiveUtils
    ]

    // Create a test container element with `.esri-view-surface`
    const testContainer = document.createElement('div')
    testContainer.id = 'test-container'
    const viewSurface = document.createElement('div')
    viewSurface.classList.add('esri-view-surface')
    testContainer.appendChild(viewSurface)

    document.body.appendChild(testContainer)

    global.navigator.geolocation = {
      getCurrentPosition: jest.fn().mockImplementation((success, error) => {
        success({
          coords: {
            latitude: 51.5074, // Mock latitude (London)
            longitude: -0.1278, // Mock longitude
            accuracy: 10
          }
        })
      }),
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

  it('should initialize with default properties', () => {
    expect(provider.srs).toBe(27700)
    expect(provider.capabilities).toBe(capabilities.esri)
    expect(provider.isUserInitiated).toBe(false)
    expect(provider.isLoaded).toBe(false)
  })

  it('should set map, view, and layers during addMap', async () => {
    const container = document.getElementById('test-container')

    const options = {
      container,
      paddingBox: {},
      bounds: [0, 0, 100, 100],
      maxExtent: [0, 0, 100, 100],
      center: [50, 50],
      zoom: 10,
      minZoom: 5,
      maxZoom: 15,
      style: { url: 'test-url', name: 'default' },
      locationLayers: [],
      callBack: jest.fn()
    }

    await provider.addMap(modules, options)
    expect(provider.baseTileLayer.watch).toHaveBeenCalled()
    expect(provider.map).toBeDefined()
    expect(provider.view).toBeDefined()
    expect(provider.baseTileLayer).toBeDefined()
    expect(provider.graphicsLayer).toBeDefined()
  })

  it('should properly set up tokenCallback and interceptorsCallback during initialization', async () => {
    const container = document.getElementById('test-container')

    const options = {
      container,
      paddingBox: {},
      bounds: [0, 0, 100, 100],
      maxExtent: [0, 0, 100, 100],
      center: [50, 50],
      zoom: 10,
      minZoom: 5,
      maxZoom: 15,
      style: { url: 'test-url', name: 'default' },
      locationLayers: [],
      callBack: jest.fn()
    }
    // Add console.log before init
    console.log('About to call init')
    await provider.init(options)
    // Add console.log after init
    console.log('After init')
    console.log('mockTokenCallback calls:', mockTokenCallback.mock.calls)

    expect(provider.tokenCallback).toBeDefined()
    expect(provider.tokenCallback).toBe(mockTokenCallback)
    expect(provider.interceptorsCallback).toBeDefined()
    expect(provider.interceptorsCallback).toBe(mockInterceptorsCallback)
    expect(container.querySelector('.esri-view-surface')).not.toBeNull()
  })
  it('should handle user-initiated map movement', async () => {
    const container = document.getElementById('test-container')

    const options = {
      container,
      paddingBox: {},
      bounds: [0, 0, 100, 100],
      maxExtent: [0, 0, 100, 100],
      center: [50, 50],
      zoom: 10,
      minZoom: 5,
      maxZoom: 15,
      style: { url: 'test-url', name: 'default' },
      locationLayers: [],
      callBack: jest.fn()
    }
    await provider.addMap(modules, options)
    provider.view.emit('drag', { action: 'start' })
    expect(provider.isUserInitiated).toBe(true)
  })

  it('should set target marker', async () => {
    const coord = [50, 50]
    const hasData = true
    const isVisible = true
    await provider.setTargetMarker(coord, hasData, isVisible)
    expect(provider.targetMarker).toBeDefined()
  })

  // it('should remove target marker', () => {
  //   provider.targetMarker = { remove: jest.fn() }
  //   provider.graphicsLayer = { remove: jest.fn() }
  //   provider.removeTargetMarker()
  //   expect(provider.graphicsLayer.remove).toHaveBeenCalledWith(provider.targetMarker)
  //   expect(provider.targetMarker).toBeNull()
  // })

  // it('should handle geolocation success', async () => {
  //   const success = jest.fn()
  //   const error = jest.fn()
  //   const mockPosition = {
  //     coords: {
  //       longitude: 0,
  //       latitude: 0
  //     }
  //   }
  //   global.navigator.geolocation = {
  //     getCurrentPosition: jest.fn().mockImplementation((successCallback) => successCallback(mockPosition))
  //   }
  //   await provider.getGeoLocation(success, error)
  //   expect(success).toHaveBeenCalled()
  // })

  // it('should handle geolocation error', async () => {
  //   const success = jest.fn()
  //   const error = jest.fn()
  //   const mockError = new Error('Geolocation error')
  //   global.navigator.geolocation = {
  //     getCurrentPosition: jest.fn().mockImplementation((_, errorCallback) => errorCallback(mockError))
  //   }
  //   await provider.getGeoLocation(success, error)
  //   expect(error).toHaveBeenCalledWith(mockError)
  // })
})
