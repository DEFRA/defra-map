/**
 * @jest-environment jsdom
 */

import AccessibleMap from './accessibleMap.js'
import historyManager from './api/historyManager.js'
import { parseDataProperties } from './api/parseDataProperties.js'
import { checkDeviceSupport } from './api/deviceChecker.js'
import { setupBehavior, shouldLoadComponent } from './api/behaviourController.js'
import { updateDOMState, removeLoadingState } from './api/domStateManager.js'
import { renderError } from './api/renderError.js'
import { createBreakpointDetector } from './utils/detectBreakpoint.js'
import { createInterfaceDetector } from './utils/detectInterfaceType.js'
import { createReverseGeocode } from './services/reverseGeocode.js'
import eventBus from './services/eventBus.js'

jest.mock('./scss/main.scss', () => ({}))
jest.mock('./api/historyManager.js', () => ({ register: jest.fn() }))
jest.mock('./api/parseDataProperties.js', () => ({ parseDataProperties: jest.fn(() => ({})) }))
jest.mock('./api/deviceChecker.js', () => ({ checkDeviceSupport: jest.fn(() => true) }))
jest.mock('./api/buttonManager.js')
jest.mock('./api/behaviourController.js', () => ({
  setupBehavior: jest.fn(),
  shouldLoadComponent: jest.fn(() => true)
}))
jest.mock('./api/domStateManager.js', () => ({ updateDOMState: jest.fn(), removeLoadingState: jest.fn() }))
jest.mock('./api/renderError.js', () => ({ renderError: jest.fn() }))
jest.mock('./config/sanitiseConfig.js', () => ({ sanitiseConfig: jest.fn(cfg => cfg) }))
jest.mock('./utils/detectBreakpoint.js', () => ({ createBreakpointDetector: jest.fn(), getBreakpoint: jest.fn(() => 'desktop') }))
jest.mock('./utils/detectInterfaceType.js', () => ({ createInterfaceDetector: jest.fn(), getInterfaceType: jest.fn(() => 'keyboard') }))
jest.mock('./services/reverseGeocode.js', () => ({ createReverseGeocode: jest.fn() }))
jest.mock('./services/eventBus.js', () => ({ on: jest.fn(), off: jest.fn(), emit: jest.fn() }))
jest.mock('./core/app/initialiseApp.js', () => ({ initialiseApp: jest.fn() }))

const { initialiseApp } = require('./core/app/initialiseApp.js')
const createButtonMock = require('./api/buttonManager.js').createButton

describe('AccessibleMap', () => {
  let rootEl
  const mapProviderMock = { load: jest.fn().mockResolvedValue([{}, {}]) }
  let openButtonCallback

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = '<div id="map"></div>'
    rootEl = document.getElementById('map')
    initialiseApp.mockResolvedValue({ _root: {}, someApi: jest.fn() })
    // Setup createButton to capture callback
    createButtonMock.mockImplementation((config, root, cb) => {
      openButtonCallback = cb
      return { style: {}, removeAttribute: jest.fn(), focus: jest.fn() }
    })
  })

  it('throws error if root element not found', () => {
    expect(() => new AccessibleMap('nonexistent')).toThrow(/not found/)
  })

  it('binds eventBus methods', () => {
    const map = new AccessibleMap('map', { mapProvider: mapProviderMock })
    expect(typeof map.on).toBe('function')
    expect(typeof map.off).toBe('function')
    expect(typeof map.emit).toBe('function')
  })

	it('returns early from constructor if device not supported', () => {
		checkDeviceSupport.mockReturnValue(false)
		const map = new AccessibleMap('map')
		// The constructor returns before registering or initializing
		expect(historyManager.register).not.toHaveBeenCalled()
		expect(createBreakpointDetector).not.toHaveBeenCalled()
		expect(createInterfaceDetector).not.toHaveBeenCalled()
	})

  it('registers with historyManager for buttonFirst behaviour', () => {
    checkDeviceSupport.mockReturnValue(true)
    new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    expect(historyManager.register).toHaveBeenCalled()
  })

  it('calls breakpoint & interface detectors', () => {
    new AccessibleMap('map', { mapProvider: mapProviderMock })
    expect(createBreakpointDetector).toHaveBeenCalled()
    expect(createInterfaceDetector).toHaveBeenCalled()
  })

  it('builds config from dataset and props', () => {
    parseDataProperties.mockReturnValue({ test: 123 })
    const map = new AccessibleMap('map', { custom: 'value', mapProvider: mapProviderMock })
    expect(map.config.test).toBe(123)
    expect(map.config.custom).toBe('value')
  })

  it('builds config including dataset from root element (line 35)', () => {
    parseDataProperties.mockReturnValue({ foo: 'bar' })
    const map = new AccessibleMap('map', { mapProvider: mapProviderMock })
    expect(map.config.foo).toBe('bar')
  })

  it('creates open button and sets up behavior', () => {
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    expect(createButtonMock).toHaveBeenCalled()
    expect(setupBehavior).toHaveBeenCalledWith(map)
  })

  it('open button click calls _handleButtonClick / loadComponent (lines 64 & 92)', async () => {
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    const loadSpy = jest.spyOn(map, 'loadComponent').mockResolvedValue()
    await openButtonCallback() // triggers _handleButtonClick
    expect(loadSpy).toHaveBeenCalled()
    loadSpy.mockRestore()
  })

	it('initializes reverseGeocode if config.reverseGeocode is provided', async () => {
		const mapProviderMock = { load: jest.fn().mockResolvedValue([{}, {}]), crs: 'EPSG:3857' }
		const configWithReverse = { behaviour: 'buttonFirst', mapProvider: mapProviderMock, reverseGeocode: { provider: 'testProvider', transformRequest: jest.fn() } }
		const map = new AccessibleMap('map', configWithReverse)
		// Mock initialiseApp to prevent full app load
		initialiseApp.mockResolvedValue({ _root: {}, someApi: jest.fn() })
		await map.loadComponent()
		expect(createReverseGeocode).toHaveBeenCalledWith(
			'testProvider',
			configWithReverse.reverseGeocode.transformRequest,
			mapProviderMock.crs
		)
	})

  it('calls loadComponent if shouldLoadComponent returns true', async () => {
    shouldLoadComponent.mockReturnValue(true)
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    await map.loadComponent()
    expect(initialiseApp).toHaveBeenCalled()
  })

  it('does not call loadComponent if shouldLoadComponent returns false (line 78)', () => {
    shouldLoadComponent.mockReturnValue(false)
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: mapProviderMock })
    expect(removeLoadingState).toHaveBeenCalled()
  })

  it('handles loadComponent errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const failingProvider = { load: jest.fn().mockRejectedValue(new Error('fail')) }
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: failingProvider, genericErrorText: 'error' })
    await expect(map.loadComponent()).rejects.toThrow('fail')
    expect(renderError).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })

  it('removes component and resets DOM/button', () => {
		const openButtonMock = { style: {}, removeAttribute: jest.fn(), focus: jest.fn() }
		const map = new AccessibleMap('map', { behaviour: 'buttonFirst' })
		// Correctly mock the instance's unmount method
		map._root = {} // just needs to be truthy
		map.unmount = jest.fn() // the method removeComponent calls
		map._openButton = openButtonMock
		map.removeComponent()
		expect(map._root).toBeNull() // now passes
		expect(map.unmount).toHaveBeenCalled() // ensure it was called
		expect(openButtonMock.removeAttribute).toHaveBeenCalledWith('style')
		expect(openButtonMock.focus).toHaveBeenCalled()
		expect(updateDOMState).toHaveBeenCalled()
	})

	it('skips unmount if _root is falsy or unmount is not a function', () => {
		const map = new AccessibleMap('map', { behaviour: 'buttonFirst' })
		map._root = null // falsy
		map.unmount = jest.fn() // won't be called
		map._openButton = { removeAttribute: jest.fn(), focus: jest.fn() }
		map.removeComponent()
		expect(map.unmount).not.toHaveBeenCalled()
		expect(map._root).toBeNull() // still null
		expect(updateDOMState).toHaveBeenCalled()
	})

	it('skips _openButton actions if _openButton is falsy', () => {
		const map = new AccessibleMap('map', { behaviour: 'buttonFirst' })
		map._root = { some: 'root' } // just truthy
		map.unmount = jest.fn()
		map._openButton = null
		map.removeComponent()
		expect(map.unmount).toHaveBeenCalled()
		expect(map._root).toBeNull()
		// No button actions executed
		expect(updateDOMState).toHaveBeenCalled()
	})
})

describe('AccessibleMap EventBus integration', () => {
  let map

  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = '<div id="map"></div>'
    map = new AccessibleMap('map', { mapProvider: { load: jest.fn().mockResolvedValue([{}, {}]) } })
  })

  it('does not overwrite eventBus methods when merging appInstance', async () => {
    const map = new AccessibleMap('map', { behaviour: 'buttonFirst', mapProvider: { load: jest.fn().mockResolvedValue([{}, {}]) } })

    // Save original references
    const originalOn = map.on
    const originalOff = map.off
    const originalEmit = map.emit

    // Mock initialiseApp to return methods that would normally overwrite eventBus
    initialiseApp.mockResolvedValue({ _root: {}, on: jest.fn(), off: jest.fn(), emit: jest.fn(), someMethod: jest.fn() })

    await map.loadComponent()

    // EventBus methods should not be replaced
    expect(map.on).toBe(originalOn)
    expect(map.off).toBe(originalOff)
    expect(map.emit).toBe(originalEmit)

    // Other properties should be merged
    expect(typeof map.someMethod).toBe('function')
  })

  it('delegates "on" calls to eventBus.on', () => {
    const cb = jest.fn()
    map.on('testEvent', cb)
    expect(eventBus.on).toHaveBeenCalledWith('testEvent', cb)
  })

  it('delegates "off" calls to eventBus.off', () => {
    const cb = jest.fn()
    map.off('testEvent', cb)
    expect(eventBus.off).toHaveBeenCalledWith('testEvent', cb)
  })

  it('delegates "emit" calls to eventBus.emit', () => {
    map.emit('testEvent', 123, 'abc')
    expect(eventBus.emit).toHaveBeenCalledWith('testEvent', 123, 'abc')
  })
})

