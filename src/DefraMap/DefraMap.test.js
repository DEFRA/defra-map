/**
 * @jest-environment jsdom
 */

import DefraMap from './DefraMap.js'
import historyManager from './historyManager.js'
import { parseDataProperties } from './parseDataProperties.js'
import { checkDeviceSupport } from './deviceChecker.js'
import { setupBehavior, shouldLoadComponent } from './behaviourController.js'
import { updateDOMState, removeLoadingState } from './domStateManager.js'
import { renderError } from './renderError.js'
import { createBreakpointDetector } from '../utils/detectBreakpoint.js'
import { createInterfaceDetector } from '../utils/detectInterfaceType.js'
import { createReverseGeocode } from '../services/reverseGeocode.js'
import eventBus from '../services/eventBus.js'

// --- Mocking Setup ---
jest.mock('../scss/main.scss', () => ({}))
jest.mock('./historyManager.js', () => ({ register: jest.fn() }))
jest.mock('./parseDataProperties.js', () => ({ parseDataProperties: jest.fn(() => ({})) }))
jest.mock('./deviceChecker.js', () => ({ checkDeviceSupport: jest.fn(() => true) }))
jest.mock('./buttonManager.js')
jest.mock('./behaviourController.js', () => ({
  setupBehavior: jest.fn(),
  shouldLoadComponent: jest.fn(() => true)
}))
jest.mock('./domStateManager.js', () => ({ updateDOMState: jest.fn(), removeLoadingState: jest.fn() }))
jest.mock('./renderError.js', () => ({ renderError: jest.fn() }))
jest.mock('../config/mergeConfig.js', () => ({ mergeConfig: jest.fn(cfg => cfg) }))
jest.mock('../utils/detectBreakpoint.js', () => ({ createBreakpointDetector: jest.fn(), getBreakpoint: jest.fn(() => 'desktop') }))
jest.mock('../utils/detectInterfaceType.js', () => ({ createInterfaceDetector: jest.fn(), getInterfaceType: jest.fn(() => 'keyboard') }))
jest.mock('../services/reverseGeocode.js', () => ({ createReverseGeocode: jest.fn() }))
jest.mock('../services/eventBus.js', () => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() }))
jest.mock('../App/initialiseApp.js', () => ({ initialiseApp: jest.fn() }))

const { initialiseApp } = require('../App/initialiseApp.js')
const createButtonMock = require('./buttonManager.js').createButton
const mapProviderMock = { load: jest.fn().mockResolvedValue([{}, {}]) }
const mockButtonInstance = { style: {}, removeAttribute: jest.fn(), focus: jest.fn() }

describe('DefraMap Core Functionality', () => {
  let rootEl
  let openButtonCallback

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = '<div id="map"></div>'
    rootEl = document.getElementById('map')
    initialiseApp.mockResolvedValue({ _root: {}, someApi: jest.fn(), unmount: jest.fn() })
    
    // Centralized mock for createButton
    createButtonMock.mockImplementation((config, root, cb) => {
      openButtonCallback = cb
      return mockButtonInstance
    })
  })

  it('throws error if root element not found', () => {
    expect(() => new DefraMap('nonexistent')).toThrow(/not found/)
  })

  it('binds eventBus methods (on/off/emit)', () => {
    const map = new DefraMap('map', { mapProvider: mapProviderMock })
    expect(typeof map.on).toBe('function')
    expect(typeof map.off).toBe('function')
    expect(typeof map.emit).toBe('function')
  })

  it('returns early from constructor if device not supported', () => {
    checkDeviceSupport.mockReturnValue(false)
    const map = new DefraMap('map')
    // The constructor returns before registering or initializing
    expect(historyManager.register).not.toHaveBeenCalled()
    expect(createBreakpointDetector).not.toHaveBeenCalled()
    expect(createInterfaceDetector).not.toHaveBeenCalled()
  })

  it('registers with historyManager for buttonFirst/hybrid behaviour', () => {
    checkDeviceSupport.mockReturnValue(true)
    new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    expect(historyManager.register).toHaveBeenCalled()
  })

  it('calls breakpoint & interface detectors', () => {
    new DefraMap('map', { mapProvider: mapProviderMock })
    expect(createBreakpointDetector).toHaveBeenCalled()
    expect(createInterfaceDetector).toHaveBeenCalled()
  })

  it('builds config from dataset and props', () => {
    parseDataProperties.mockReturnValue({ test: 123 })
    const map = new DefraMap('map', { custom: 'value', mapProvider: mapProviderMock })
    expect(map.config.test).toBe(123)
    expect(map.config.custom).toBe('value')
  })

  it('creates open button and sets up behavior', () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    expect(createButtonMock).toHaveBeenCalled()
    expect(setupBehavior).toHaveBeenCalledWith(map)
  })

  it('open button click calls _handleButtonClick / loadComponent', async () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    const loadSpy = jest.spyOn(map, 'loadComponent').mockResolvedValue()
    await openButtonCallback() // triggers _handleButtonClick
    expect(loadSpy).toHaveBeenCalled()
    loadSpy.mockRestore()
  })

  it('initializes reverseGeocode if reverseGeocodeProvider is provided', async () => {
    const mapProviderWithCRS = { load: jest.fn().mockResolvedValue([{}, {}]), crs: 'EPSG:3857' }
    const configWithReverse = { behaviour: 'buttonFirst', mapProvider: mapProviderWithCRS, reverseGeocodeProvider: { url: 'https://example.com', apiKey: '123' }}
    const map = new DefraMap('map', configWithReverse)
    await map.loadComponent()
    expect(createReverseGeocode).toHaveBeenCalledWith(
      configWithReverse.reverseGeocodeProvider,
      mapProviderWithCRS.crs
    )
  })

  it('calls loadComponent if shouldLoadComponent returns true', async () => {
    shouldLoadComponent.mockReturnValue(true)
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    // We need to await loadComponent to ensure initialiseApp is called
    await map.loadComponent()
    expect(initialiseApp).toHaveBeenCalled()
  })

  it('does not call loadComponent if shouldLoadComponent returns false', () => {
    shouldLoadComponent.mockReturnValue(false)
    new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    // Check the alternative path in _initialize
    expect(removeLoadingState).toHaveBeenCalled()
  })

  it('handles loadComponent errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const failingProvider = { load: jest.fn().mockRejectedValue(new Error('fail')) }
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: failingProvider, genericErrorText: 'error' })
    await expect(map.loadComponent()).rejects.toThrow('fail')
    expect(renderError).toHaveBeenCalledWith(rootEl, 'error')
    consoleErrorSpy.mockRestore()
  })
  
  it('does not overwrite eventBus methods when merging appInstance', async () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })

    // Save original references
    const originalOn = map.on
    
    initialiseApp.mockResolvedValue({ _root: {}, on: jest.fn(), off: jest.fn(), emit: jest.fn(), someMethod: jest.fn() })

    await map.loadComponent()

    // EventBus methods should not be replaced
    expect(map.on).toBe(originalOn)
    // Other properties should be merged
    expect(typeof map.someMethod).toBe('function')
  })

  it('removes component and resets DOM/button', () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    
    // Set up state as if component was loaded
    map._root = {} 
    map.unmount = jest.fn() 
    map._openButton = mockButtonInstance
    
    map.removeComponent()
    
    expect(map._root).toBeNull() 
    expect(map.unmount).toHaveBeenCalled() 
    expect(mockButtonInstance.removeAttribute).toHaveBeenCalledWith('style')
    expect(mockButtonInstance.focus).toHaveBeenCalled()
    expect(updateDOMState).toHaveBeenCalledWith(map)
  })

  it('skips unmount if _root is falsy or unmount is not a function', () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    map._root = null // falsy
    map.unmount = jest.fn()
    map._openButton = mockButtonInstance
    map.removeComponent()
    expect(map.unmount).not.toHaveBeenCalled()
    expect(updateDOMState).toHaveBeenCalled()
  })

  it('skips _openButton actions if _openButton is falsy', () => {
    const map = new DefraMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    map._root = { some: 'root' } // just truthy
    map.unmount = jest.fn()
    map._openButton = null
    map.removeComponent()
    expect(map.unmount).toHaveBeenCalled()
    // No button actions executed
    expect(updateDOMState).toHaveBeenCalled()
  })
})

// --- Combined API Tests (Including new Location Marker methods) ---

describe('DefraMap Public API Methods', () => {
  let map

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = '<div id="map"></div>'
    map = new DefraMap('map', { mapProvider: mapProviderMock })
  })

  it('delegates all EventBus and Location Marker API calls correctly', () => {
    const cb = jest.fn()
    const coords = [10.5, 20.5]
    const options = { color: 'red' }
    
    // 1. Core EventBus methods
    map.on('testEvent', cb)
    map.off('testEvent', cb)
    map.emit('customEvent', 123)
    
    expect(eventBus.on).toHaveBeenCalledWith('testEvent', cb)
    expect(eventBus.off).toHaveBeenCalledWith('testEvent', cb)
    expect(eventBus.emit).toHaveBeenCalledWith('customEvent', 123)
    
    // 2. Location Marker API methods (New Coverage)
    map.addLocationMarker('marker-1', coords, options)
    map.removeLocationMarker('marker-1')
    
    expect(eventBus.emit).toHaveBeenCalledWith('app:addlocationmarker', {
      id: 'marker-1',
      coords: coords,
      options: options
    })
    expect(eventBus.emit).toHaveBeenCalledWith('app:removelocationmarker', 'marker-1')
  })
})