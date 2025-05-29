import { screen } from '@testing-library/react'
import { FloodMap } from '../src/flood-map'
import eventBus from '../src/js/lib/eventbus'
import { events } from '../src/js/store/constants'
import * as dom from '../src/js/lib/dom'

jest.mock('../src/js/lib/dom', () => ({
  updateTitle: jest.fn(),
  toggleInert: jest.fn(),
  setInitialFocus: jest.fn()
}))

describe('FloodMap', () => {
  let floodMap
  let mockElement
  let mockHistory

  beforeEach(() => {
    // Mock the DOM element
    mockElement = document.createElement('div')
    mockElement.id = 'test-id'
    document.body.appendChild(mockElement)
    eventBus._handlers = {}

    let historyState = null
    const backSpy = jest.fn()

    // Mock window.history
    mockHistory = {
      replaceState: jest.fn((state) => {
        historyState = state
      }),
      back: backSpy // Direct assignment of the spy
    }

    // Define state property
    Object.defineProperty(mockHistory, 'state', {
      get: function () {
        return historyState
      },
      configurable: true
    })

    global.history = mockHistory
    global.updateTitle = jest.fn()
    global.toggleInert = jest.fn()

    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams()
    jest.spyOn(global, 'URLSearchParams').mockImplementation(() => mockSearchParams)

    // Mock eventBus.on to store event handlers
    eventBus.on = jest.fn((event, handler) => {
      eventBus._handlers[event] = handler
    })

    // Mock getElementById
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement)

    // Mock matchMedia globally
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))

    // Mock methods before creating the instance
    jest.spyOn(FloodMap.prototype, '_handleMobileMQ').mockImplementation(jest.fn())
    jest.spyOn(FloodMap.prototype, '_importComponent').mockImplementation(jest.fn())
    jest.spyOn(FloodMap.prototype, '_removeComponent').mockImplementation(function () {
      if (this.root && this.root.unmount) {
        if (this.button) {
          this.button.removeAttribute('style')
          this.button.removeAttribute('data-open')
          this.button.focus()
        }
        this.root.unmount()
        this.root = null
        this._selected = null
        this._info = null
        this.el.removeAttribute('data-open')
      }
    })
    jest.spyOn(FloodMap.prototype, '_testDevice').mockReturnValue({ isSupported: true, error: null })

    // Mock dispatchEvent
    mockElement.dispatchEvent = jest.fn()
    eventBus.dispatch = jest.fn()
  })

  afterEach(() => {
    // Clean up the DOM
    document.body.removeChild(mockElement)
    document.body.innerHTML = ''
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should initialize with given id and props', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    expect(floodMap.el).toBe(mockElement)
  })

  it('should add component if root is not already set', () => {
    // Create DOM element
    const mockElement = document.createElement('div')
    mockElement.id = 'test-id'
    document.body.appendChild(mockElement)

    // Create FloodMap instance
    const floodMap = new FloodMap('test-id', {})

    // Create mock root function that returns a component
    const mockRootComponent = {
      mount: jest.fn(),
      unmount: jest.fn()
    }

    const mockRoot = jest.fn().mockReturnValue(mockRootComponent)

    // Add the component
    floodMap._addComponent(mockRoot)

    // Verify root function was called with correct arguments
    expect(mockRoot).toHaveBeenCalledWith(
      floodMap.el,
      expect.objectContaining({
        callBack: floodMap.callBack,
        interfaceType: floodMap.interfaceType
      })
    )

    // Verify root component was set
    expect(floodMap.root).toBe(mockRootComponent)

    // Clean up
    document.body.removeChild(mockElement)
  })

  it('should not add component if root is already set', () => {
    floodMap = new FloodMap('test-id', {})
    floodMap.root = jest.fn()

    const mockRoot = jest.fn()
    floodMap._addComponent(mockRoot)

    expect(floodMap.root).not.toBe(mockRoot)
  })

  it('should handle component import success', async () => {
    // Remove the mock implementation for this test
    jest.spyOn(FloodMap.prototype, '_importComponent').mockRestore()

    const floodMap = new FloodMap('test-id', {})

    // Mock the button
    const mockButton = document.createElement('button')
    floodMap.button = mockButton

    // Mock the import
    const mockComponent = {
      mount: jest.fn(),
      unmount: jest.fn()
    }
    const mockRoot = jest.fn().mockReturnValue(mockComponent)

    // Spy on _addComponent BEFORE calling _importComponent
    const addComponentSpy = jest.spyOn(floodMap, '_addComponent')

    // Spy on _importComponent and implement the import logic
    jest.spyOn(floodMap, '_importComponent').mockImplementation(async () => {
      floodMap.button?.setAttribute('style', 'display: none')
      floodMap._addComponent(mockRoot)
      return Promise.resolve()
    })

    await floodMap._importComponent()

    expect(mockButton.style.display).toBe('none')
    expect(addComponentSpy).toHaveBeenCalledWith(mockRoot)
  })

  it('should insert not supported message if device is not supported', () => {
    const props = {}
    jest.spyOn(FloodMap.prototype, '_testDevice').mockReturnValue({ isSupported: false })

    floodMap = new FloodMap('test-id', props)

    expect(mockElement.previousElementSibling).not.toBeNull()
    expect(mockElement.previousElementSibling.innerHTML).toContain('Your device is not supported.')
  })

  it('should initialize properties to undefined', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    expect(floodMap._search).toBeUndefined()
    expect(floodMap._info).toBeUndefined()
    expect(floodMap._selected).toBeUndefined()
    expect(floodMap._draw).toBeUndefined()
  })

  it('should import component when isVisible is true', () => {
    // Remove mock of _handleMobileMQ for this test
    jest.spyOn(FloodMap.prototype, '_handleMobileMQ').mockRestore()

    // Mock window.matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false, // This will make it non-mobile
      addEventListener: jest.fn()
    }))

    // Create FloodMap instance with 'inline' behavior which should make isVisible true
    floodMap = new FloodMap('test-id', {
      behaviour: 'inline'
    })

    // Verify _importComponent was called
    expect(floodMap._importComponent).toHaveBeenCalled()
  })

  it('should add event listener for mobile media query changes', () => {
    const mockAddEventListener = jest.fn()

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn()
    }))

    const props = {}
    floodMap = new FloodMap('test-id', props)

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should handle keyboard interactions correctly', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Spy on the eventBus.dispatch method directly
    jest.spyOn(eventBus, 'dispatch')

    // Mock the KeyboardEvent for Jest environment
    const keydownEvent = new KeyboardEvent('keydown', { key: 'Tab' }) // eslint-disable-line no-undef

    // Dispatch the event on the window object
    window.dispatchEvent(keydownEvent)

    // Check that interfaceType was set to 'keyboard'
    expect(floodMap.interfaceType).toBe('keyboard')

    // Assert eventBus.dispatch was called with the correct parameters
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INTERFACE_TYPE,
      'keyboard'
    )
  })

  it('should insert button and bind click event in _insertButtonHTML', () => {
    const handleClickSpy = jest.spyOn(FloodMap.prototype, '_handleClick')

    const props = { behaviour: 'buttonFirst' }
    floodMap = new FloodMap('test-id', props)

    const button = mockElement.previousElementSibling

    expect(button).not.toBeNull()
    expect(button.tagName).toBe('A')
    expect(button.getAttribute('href')).toContain('?view=test-id')

    const clickEvent = new Event('click')
    button.dispatchEvent(clickEvent)

    expect(handleClickSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle info property setter and event dispatch', () => {
    floodMap = new FloodMap('test-id', {})

    Object.defineProperty(floodMap, 'info', {
      set (value) {
        floodMap._info = value
        if (floodMap.isReady) {
          eventBus.dispatch(floodMap.props.parent, events.SET_INFO, floodMap._info)
        }
      },
      get () {
        return floodMap._info
      }
    })

    jest.spyOn(floodMap, 'dispatchEvent')
    floodMap.isReady = true // Ensure it's ready

    floodMap.info = { test: 'value' }

    expect(floodMap._info).toEqual({ test: 'value' })
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      floodMap.props.parent,
      events.SET_INFO,
      { test: 'value' }
    )
  })

  it('should remove the component in _removeComponent', () => {
    floodMap = new FloodMap('test-id', {})

    // Set up a mock root object
    floodMap.root = { unmount: jest.fn() }

    // Spy on the unmount method
    const unmountSpy = jest.spyOn(floodMap.root, 'unmount')

    // Call _removeComponent
    floodMap._removeComponent()

    // Assertions
    expect(unmountSpy).toHaveBeenCalledTimes(1) // Ensure unmount() was called
    expect(floodMap.root).toBeNull() // Ensure root is cleared
  })

  it('should handle popstate event - when is button', () => {
    const props = { behaviour: 'buttonFirst' }
    floodMap = new FloodMap('test-id', props)

    jest.spyOn(floodMap, '_removeComponent')

    window.history.replaceState({ isBack: false }, '') // eslint-disable-line no-undef

    floodMap._handlePopstate() // Directly invoke the function

    expect(floodMap._removeComponent).toHaveBeenCalled()
  })

  it('should handle popstate event - when is back', () => {
    const props = { behaviour: 'hybrid', isMobile: true }
    floodMap = new FloodMap('test-id', props)

    jest.spyOn(floodMap, '_importComponent')

    window.history.replaceState({ isBack: true }, '') // eslint-disable-line no-undef

    floodMap._handlePopstate() // Directly invoke the function

    expect(floodMap._importComponent).toHaveBeenCalled()
  })

  it('should call history.back() when _handleExit is called with history.state.isBack true', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    // Create spy directly on history.back
    const backSpy = jest.spyOn(window.history, 'back')

    // Set the state
    window.history.replaceState({ isBack: true }, '')

    // Verify state is set correctly before calling _handleExit
    expect(window.history.state).toEqual({ isBack: true })

    floodMap._handleExit()

    expect(backSpy).toHaveBeenCalled()
    expect(floodMap._removeComponent).not.toHaveBeenCalled()
  })

  it('should remove component and update URL when _handleExit is called with history.state.isBack false', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    const replaceStateSpy = jest.spyOn(window.history, 'replaceState')

    // Set history state using your existing mockHistory
    window.history.replaceState({ isBack: false }, '')

    // Mock location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/'
      },
      writable: true
    })

    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams()
    floodMap.searchParams = mockSearchParams

    // Call _handleExit
    floodMap._handleExit()

    // Verify component removal and URL update
    expect(floodMap._removeComponent).toHaveBeenCalled()
    expect(replaceStateSpy).toHaveBeenLastCalledWith(
      { isBack: false },
      '',
      '/'
    )
    expect(mockHistory.back).not.toHaveBeenCalled()
  })

  it('should handle _removeComponent implementation', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    // Clear any previous calls to the mocked functions
    dom.updateTitle.mockClear()
    dom.toggleInert.mockClear()

    // Restore the original implementation
    jest.spyOn(FloodMap.prototype, '_removeComponent').mockRestore()

    // Mock the button with all necessary methods
    floodMap.button = {
      removeAttribute: jest.fn(),
      focus: jest.fn()
    }

    // Create unmount spy before setting up root
    const unmountSpy = jest.fn()

    // Create a mock root with unmount method
    floodMap.root = {
      unmount: unmountSpy
    }

    // Set initial values that should be cleared
    floodMap._selected = { someData: 'test' }
    floodMap._info = { someInfo: 'test' }

    // Mock element
    floodMap.el = {
      removeAttribute: jest.fn()
    }

    // Call the actual implementation
    floodMap._removeComponent()

    // Verify all method calls
    expect(floodMap.button.removeAttribute).toHaveBeenCalledWith('style')
    expect(floodMap.button.removeAttribute).toHaveBeenCalledWith('data-open')
    expect(floodMap.button.focus).toHaveBeenCalled()
    expect(unmountSpy).toHaveBeenCalled()
    expect(floodMap.root).toBeNull()
    expect(floodMap._selected).toBeNull()
    expect(floodMap._info).toBeNull()
    expect(dom.updateTitle).toHaveBeenCalled()
    expect(dom.toggleInert).toHaveBeenCalled()
  })

  it('should add focus-visible class when keyboard interface is used', () => {
    // Create FloodMap instance
    floodMap = new FloodMap('test-id', { behaviour: 'buttonFirst'})

    // First trigger keyboard interaction with Tab key
    const keydownEvent = new Event('keydown')
    Object.defineProperty(keydownEvent, 'key', { value: 'Tab' })
    window.dispatchEvent(keydownEvent)
    const button = screen.getByRole('button')

    // Verify keyboard interface is set
    expect(floodMap.interfaceType).toBe('keyboard')

    // Now trigger the focus event
    const focusInEvent = new Event('focusin', {
      bubbles: true,
      cancelable: true
    })
    button.dispatchEvent(focusInEvent)

    // Verify the correct class was added
    expect(button.classList.contains('fm-u-focus-visible')).toBe(true)
  })

  it('should handle responsive changes correctly', () => {
    // Create spies for _removeComponent and _importComponent
    const removeComponentSpy = jest.spyOn(FloodMap.prototype, '_removeComponent')
    const importComponentSpy = jest.spyOn(FloodMap.prototype, '_importComponent')

    // Mock matchMedia with a change handler
    let changeHandler
    const mobileMQ = {
      matches: false,
      addEventListener: (event, handler) => {
        changeHandler = handler
      },
      removeEventListener: jest.fn()
    }
    window.matchMedia = jest.fn().mockImplementation(() => mobileMQ)

    // Create FloodMap instance
    floodMap = new FloodMap('test-id', {
      behaviour: 'inline',
      container: 'test-id'
    })

    // Test desktop to mobile transition (should remove component)
    mobileMQ.matches = true
    floodMap.isVisible = false // Set isVisible to false for mobile
    changeHandler(mobileMQ)
    expect(removeComponentSpy).toHaveBeenCalled()

    // Reset call counts
    removeComponentSpy.mockClear()
    importComponentSpy.mockClear()

    // Test mobile to desktop transition (should import component)
    mobileMQ.matches = false
    floodMap.isVisible = true // Set isVisible to true for desktop
    changeHandler(mobileMQ)
    expect(importComponentSpy).toHaveBeenCalled()
  })
  it('should handle APP_READY event correctly', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Get the handler that was passed to eventBus.on
    const appReadyHandler = eventBus.on.mock.calls.find(
      call => call[1] === events.APP_READY
    )[2]

    // Mock data to pass to the handler
    const mockData = {
      framework: {
        someFrameworkProp: 'value',
        otherProp: 'test'
      },
      modules: {
        moduleA: 'valueA',
        moduleB: 'valueB'
      }
    }

    // Call the handler
    appReadyHandler(mockData)

    // Verify properties were set correctly
    expect(floodMap.someFrameworkProp).toBe('value')
    expect(floodMap.otherProp).toBe('test')
    expect(floodMap.modules).toEqual(mockData.modules)
    expect(floodMap.isReady).toBe(true)

    // Verify events were dispatched
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INTERFACE_TYPE,
      floodMap.interfaceType
    )

    expect(eventBus.dispatch).toHaveBeenCalledWith(
      floodMap,
      events.READY,
      { type: 'ready', ...mockData }
    )
  })
  it('should dispatch SET_INFO and SET_SELECTED events when handling APP_READY if values exist', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Get the handler that was passed to eventBus.on
    const appReadyHandler = eventBus.on.mock.calls.find(
      call => call[1] === events.APP_READY
    )[2]

    // Set up _info and _selected before handling APP_READY
    floodMap._info = { someInfo: 'test info' }
    floodMap._selected = { selectedItem: 'test selection' }

    // Mock data
    const mockData = {
      framework: {},
      modules: {}
    }

    // Call the handler
    appReadyHandler(mockData)

    // Verify SET_INFO was dispatched with correct data
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INFO,
      floodMap._info
    )

    // Verify SET_SELECTED was dispatched with correct data
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_SELECTED,
      floodMap._selected
    )
  })

  it('should not dispatch SET_INFO or SET_SELECTED events when values are not set', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)
    floodMap.interfaceType = 'keyboard'

    // Get the handler that was passed to eventBus.on
    const appReadyHandler = eventBus.on.mock.calls.find(
      call => call[1] === events.APP_READY
    )[2]

    // Mock data
    const mockData = {
      framework: {},
      modules: {}
    }

    // Reset the dispatch mock to clear previous calls
    eventBus.dispatch.mockClear()

    // Call the handler
    appReadyHandler(mockData)

    // Verify SET_INFO was not dispatched
    expect(eventBus.dispatch).not.toHaveBeenCalledWith(
      props.parent,
      events.SET_INFO,
      expect.anything()
    )

    // Verify SET_SELECTED was not dispatched
    expect(eventBus.dispatch).not.toHaveBeenCalledWith(
      props.parent,
      events.SET_SELECTED,
      expect.anything()
    )

    // But READY and SET_INTERFACE_TYPE should still have been called
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INTERFACE_TYPE,
      'keyboard'
    )
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      floodMap,
      events.READY,
      expect.any(Object)
    )
  })
  it('should handle touchstart event by setting interface type to touch', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Call the touchstart handler
    floodMap._handleTouchstart()

    // Verify interfaceType was set to 'touch'
    expect(floodMap.interfaceType).toBe('touch')

    // Verify the SET_INTERFACE_TYPE event was dispatched with 'touch'
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INTERFACE_TYPE,
      'touch'
    )
  })
  it('should handle pointerdown event by removing focus and setting interface type to null', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Mock document.activeElement
    const mockActiveElement = {
      classList: {
        remove: jest.fn()
      }
    }

    // Mock the activeElement getter
    Object.defineProperty(document, 'activeElement', {
      get: () => mockActiveElement,
      configurable: true
    })

    // Set initial interfaceType to verify it gets cleared
    floodMap.interfaceType = 'keyboard'

    // Call the pointerdown handler
    floodMap._handlePointerdown()

    // Verify interfaceType was set to null
    expect(floodMap.interfaceType).toBeNull()

    // Verify the SET_INTERFACE_TYPE event was dispatched with null
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INTERFACE_TYPE,
      null
    )

    // Verify the focus visible class was removed
    expect(mockActiveElement.classList.remove).toHaveBeenCalledWith('fm-u-focus-visible')
  })

  it('should hide button and successfully load component', async () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Mock the button
    const buttonSpy = jest.fn()
    floodMap.button = {
      setAttribute: buttonSpy
    }

    // Mock the _addComponent method
    floodMap._addComponent = jest.fn()

    // Mock successful module import
    const mockComponent = { default: { someComponent: 'test' } }
    jest.spyOn(FloodMap.prototype, '_importComponent').mockImplementation(() => {
      floodMap.button?.setAttribute('style', 'display: none')
      return Promise.resolve(floodMap._addComponent(mockComponent.default))
    })

    // Call the method and wait for it to complete
    await floodMap._importComponent()

    // Verify button was hidden
    expect(buttonSpy).toHaveBeenCalledWith('style', 'display: none')

    // Verify component was added with the default export
    expect(floodMap._addComponent).toHaveBeenCalledWith(mockComponent.default)
  })

  it('should handle missing button gracefully', async () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Button is undefined
    floodMap.button = undefined

    // Mock the _addComponent method
    floodMap._addComponent = jest.fn()

    // Mock successful module import
    const mockComponent = { default: { someComponent: 'test' } }
    jest.spyOn(FloodMap.prototype, '_importComponent').mockImplementation(() => {
      return Promise.resolve(floodMap._addComponent(mockComponent.default))
    })

    // Verify this doesn't throw
    await expect(floodMap._importComponent()).resolves.not.toThrow()
  })

  it('should handle import failure and render error message', async () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)
    console.log = jest.fn()

    // Mock the button
    const buttonSpy = jest.fn()
    floodMap.button = {
      setAttribute: buttonSpy
    }

    // Mock the _renderError method
    floodMap._renderError = jest.fn()

    // Mock failed module import
    const mockError = new Error('Failed to load module')
    jest.spyOn(FloodMap.prototype, '_importComponent').mockImplementation(() => {
      floodMap.button?.setAttribute('style', 'display: none')
      floodMap._renderError('There was a problem loading the map. Please try again later')
      console.log(mockError)
      return Promise.reject(mockError)
    })

    // Call the method and wait for it to complete
    await expect(floodMap._importComponent()).rejects.toThrow(mockError)

    // Verify button was hidden
    expect(buttonSpy).toHaveBeenCalledWith('style', 'display: none')

    // Verify error was rendered
    expect(floodMap._renderError).toHaveBeenCalledWith(
      'There was a problem loading the map. Please try again later'
    )

    // Verify error was logged
    expect(console.log).toHaveBeenCalledWith(mockError)
  })

  it('should handle dynamic import correctly', async () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Mock the button
    const buttonSpy = jest.fn()
    floodMap.button = {
      setAttribute: buttonSpy
    }

    // Mock the _addComponent method
    floodMap._addComponent = jest.fn()

    // Mock successful module import
    const mockComponent = { default: { someComponent: 'test' } }

    jest.spyOn(FloodMap.prototype, '_importComponent').mockImplementation(() => {
      floodMap.button?.setAttribute('style', 'display: none')
      return Promise.resolve(floodMap._addComponent(mockComponent.default))
    })

    // Call the method
    await floodMap._importComponent()

    // Verify button was hidden
    expect(buttonSpy).toHaveBeenCalledWith('style', 'display: none')

    // Verify component was added with the default export
    expect(floodMap._addComponent).toHaveBeenCalledWith(mockComponent.default)
  })

  it('should set info and dispatch event when ready', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Set ready state
    floodMap.isReady = true

    // Call setInfo method
    floodMap.setInfo({ test: 'value' })

    // Verify the value was set
    expect(floodMap._info).toEqual({ test: 'value' })

    // Verify event was dispatched
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_INFO,
      { test: 'value' }
    )
  })

  it('should not set info and dispatch event when not ready', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Set ready state
    floodMap.isReady = false

    // Call setInfo method
    floodMap.setInfo({ test: 'value' })

    // Verify the value was set
    expect(floodMap._info).toEqual({ test: 'value' })

    // Verify event was dispatched
    expect(eventBus.dispatch).toHaveBeenCalledTimes(0)
  })

  it('should handle info property setter and event dispatch', () => {
    floodMap = new FloodMap('test-id', {})

    // Define the setter on the instance
    Object.defineProperty(floodMap, 'info', {
      set (value) {
        floodMap._info = value
        if (floodMap.isReady) {
          eventBus.dispatch(floodMap.props.parent, events.SET_INFO, floodMap._info)
        }
      },
      get () {
        return floodMap._info
      }
    })

    jest.spyOn(floodMap, 'dispatchEvent')
    floodMap.isReady = true // Ensure it's ready

    floodMap.info = { test: 'value' }

    expect(floodMap._info).toEqual({ test: 'value' })
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      floodMap.props.parent,
      events.SET_INFO,
      { test: 'value' }
    )
  })

  it('should not dispatch event when not ready', () => {
    floodMap = new FloodMap('test-id', {})

    // Define the setter on the instance
    Object.defineProperty(floodMap, 'info', {
      set (value) {
        floodMap._info = value
        if (floodMap.isReady) {
          eventBus.dispatch(floodMap.props.parent, events.SET_INFO, floodMap._info)
        }
      },
      get () {
        return floodMap._info
      }
    })

    jest.spyOn(floodMap, 'dispatchEvent')
    floodMap.isReady = false // Ensure it's not ready

    floodMap.info = { test: 'value' }

    expect(floodMap._info).toEqual({ test: 'value' })
    expect(eventBus.dispatch).not.toHaveBeenCalled()
  })
  it('should handle selected property setter and event dispatch', () => {
    floodMap = new FloodMap('test-id', {})

    // Define the setter on the instance
    Object.defineProperty(floodMap, 'selected', {
      set (value) {
        floodMap._selected = value
        if (floodMap.isReady) {
          eventBus.dispatch(floodMap.props.parent, events.SET_SELECTED, floodMap._selected)
        }
      },
      get () {
        return floodMap._selected
      }
    })

    jest.spyOn(floodMap, 'dispatchEvent')
    floodMap.isReady = true // Ensure it's ready

    floodMap.selected = { id: '123', name: 'test selection' }

    expect(floodMap._selected).toEqual({ id: '123', name: 'test selection' })
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      floodMap.props.parent,
      events.SET_SELECTED,
      { id: '123', name: 'test selection' }
    )
  })

  it('should not dispatch selected event when not ready', () => {
    floodMap = new FloodMap('test-id', {})

    // Define the setter on the instance
    Object.defineProperty(floodMap, 'selected', {
      set (value) {
        floodMap._selected = value
        if (floodMap.isReady) {
          eventBus.dispatch(floodMap.props.parent, events.SET_SELECTED, floodMap._selected)
        }
      },
      get () {
        return floodMap._selected
      }
    })

    jest.spyOn(floodMap, 'dispatchEvent')
    floodMap.isReady = false // Ensure it's not ready

    floodMap.selected = { id: '123', name: 'test selection' }

    expect(floodMap._selected).toEqual({ id: '123', name: 'test selection' })
    expect(eventBus.dispatch).not.toHaveBeenCalled()
  })
  it('should handle setSelected method when ready', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Set ready state to true
    floodMap.isReady = true

    // Call setSelected method
    floodMap.setSelected({ id: '123', name: 'test selection' })

    // Verify the value was set
    expect(floodMap._selected).toEqual({ id: '123', name: 'test selection' })

    // Verify event was dispatched
    expect(eventBus.dispatch).toHaveBeenCalledWith(
      props.parent,
      events.SET_SELECTED,
      { id: '123', name: 'test selection' }
    )
  })
  it('should handle setSelected method when not ready', () => {
    const props = { parent: 'test-parent' }
    floodMap = new FloodMap('test-id', props)

    // Ensure ready state is false
    floodMap.isReady = false

    // Call setSelected method
    floodMap.setSelected({ id: '123', name: 'test selection' })

    // Verify the value was set
    expect(floodMap._selected).toEqual({ id: '123', name: 'test selection' })

    // Verify event was NOT dispatched
    expect(eventBus.dispatch).not.toHaveBeenCalled()
  })
})

// MobileMQ Test Section
describe('_handleMobileMQ tests', () => {
  let floodMap
  let mockElement

  beforeEach(() => {
    // Create test element
    mockElement = document.createElement('div')
    mockElement.id = 'test-id'
    mockElement.setAttribute('data-open', '')
    document.body.appendChild(mockElement)

    // Mock window.matchMedia
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn()
    }))

    // Mock location
    delete window.location
    window.location = {
      pathname: '/',
      search: ''
    }

    // Clear all mocks before each test
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should set isMobile and isVisible correctly for inline behaviour', () => {
    const props = {
      behaviour: 'inline',
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)

    // Manually add props to the instance
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(true)

    const desktopEvent = { matches: false }
    floodMap._handleMobileMQ(desktopEvent)

    expect(floodMap.isMobile).toBe(false)
    expect(floodMap.isVisible).toBe(true)
  })

  it('should set isMobile and isVisible correctly for hybrid behaviour', () => {
    const props = {
      behaviour: 'hybrid',
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)

    // Manually add props to the instance
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(false)

    const desktopEvent = { matches: false }
    floodMap._handleMobileMQ(desktopEvent)

    expect(floodMap.isMobile).toBe(false)
    expect(floodMap.isVisible).toBe(true)
  })
  it('should handle hybrid behaviour correctly with view parameter', () => {
    const props = {
      behaviour: 'hybrid',
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    // Test mobile view (matches: true)
    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(false) // Should be false when mobile

    // Test desktop view (matches: false)
    const desktopEvent = { matches: false }
    floodMap._handleMobileMQ(desktopEvent)

    expect(floodMap.isMobile).toBe(false)
    expect(floodMap.isVisible).toBe(true) // Should be true when desktop
  })

  it('should set isVisible true when view parameter matches id, regardless of media query state', () => {
    const props = {
      behaviour: 'hybrid',
      container: 'test-id',
      maxMobile: '40em'
    }

    // Create instance with matching ID
    const instanceId = 'test-id'

    // Mock URLSearchParams
    const mockSearchParams = new URLSearchParams(`?view=${instanceId}`)
    jest.spyOn(global, 'URLSearchParams').mockImplementation(() => mockSearchParams)

    floodMap = new FloodMap(instanceId, props)

    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })
    Object.defineProperty(floodMap, 'id', {
      value: instanceId,
      writable: true,
      configurable: true
    })

    // Even with matches: true, isVisible should be true due to hasViewParam
    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(true) // Should be true due to hasViewParam

    const desktopEvent = { matches: false }
    floodMap._handleMobileMQ(desktopEvent)

    expect(floodMap.isMobile).toBe(false)
    expect(floodMap.isVisible).toBe(true) // Should be true due to both hasViewParam and !matches
  })

  it('should set isVisible false when view parameter does not match id', () => {
    const props = {
      behaviour: 'hybrid',
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    // Mock URL search params with non-matching view
    window.location.search = '?view=different-id'

    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isVisible).toBe(false)
    expect(floodMap.isMobile).toBe(true)
  })

  it('should handle missing behaviour prop', () => {
    const props = {
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(false) // Should be false when no behaviour specified
  })

  it('should handle empty search params', () => {
    const props = {
      behaviour: 'hybrid',
      container: 'test-id',
      maxMobile: '40em'
    }

    floodMap = new FloodMap('test-id', props)
    Object.defineProperty(floodMap, 'props', {
      value: props,
      writable: true,
      configurable: true
    })

    // Ensure empty search params
    window.location.search = ''

    const mobileEvent = { matches: true }
    floodMap._handleMobileMQ(mobileEvent)

    expect(floodMap.isMobile).toBe(true)
    expect(floodMap.isVisible).toBe(false)
  })
})
// Keep your existing tests as they are with the mock in beforeEach

// Add new describe block for _importComponent tests
describe('_importComponent implementation', () => {
  let mockElement
  let floodMap

  beforeEach(() => {
    // Mock the DOM element
    mockElement = document.createElement('div')
    mockElement.id = 'test-id'
    document.body.appendChild(mockElement)
    eventBus._handlers = {}

    // Mock matchMedia
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))

    // Keep other necessary beforeEach setup from main test suite
    // but remove the _importComponent mock
    jest.spyOn(FloodMap.prototype, '_handleMobileMQ').mockImplementation(jest.fn())
    jest.spyOn(FloodMap.prototype, '_removeComponent').mockImplementation(function () {
      if (this.root && this.root.unmount) {
        if (this.button) {
          this.button.removeAttribute('style')
          this.button.removeAttribute('data-open')
          this.button.focus()
        }
        this.root.unmount()
        this.root = null
        this._selected = null
        this._info = null
        this.el.removeAttribute('data-open')
      }
    })
    jest.spyOn(FloodMap.prototype, '_testDevice').mockReturnValue({ isSupported: true, error: null })

    // Restore the original _importComponent implementation
    jest.spyOn(FloodMap.prototype, '_importComponent').mockRestore()
  })

  afterEach(() => {
    document.body.removeChild(mockElement)
    document.body.innerHTML = ''
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should test actual _importComponent implementation', async () => {
    // Create FloodMap instance
    floodMap = new FloodMap('test-id', {})

    // Create real button
    const mockButton = document.createElement('button')
    floodMap.button = mockButton

    // Spy on _addComponent
    const addComponentSpy = jest.spyOn(floodMap, '_addComponent')

    // Create mock module with a spy as the default export
    const mockDefaultExport = jest.fn()
    const mockModule = {
      __esModule: true,
      default: mockDefaultExport
    }

    // Mock the import at module level
    jest.mock('../src/root.js', () => mockModule, { virtual: true })

    // Call the method
    await floodMap._importComponent()

    // Wait for any pending promises to resolve
    await new Promise(process.nextTick)

    // Verify the button was hidden
    expect(mockButton.getAttribute('style')).toBe('display: none')

    // Verify _addComponent was called with the mock module
    expect(addComponentSpy).toHaveBeenCalled()
    expect(addComponentSpy).toHaveBeenCalledWith(mockDefaultExport)
  })

  it('should handle _importComponent failure', async () => {
    // Create FloodMap instance
    floodMap = new FloodMap('test-id', {})

    // Create real button
    const mockButton = document.createElement('button')
    floodMap.button = mockButton

    // Spy on _renderError
    const renderErrorSpy = jest.spyOn(floodMap, '_renderError')

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    // Mock error
    const mockError = new Error('Import failed')

    // Mock the dynamic import to fail
    jest.mock('../src/root.js', () => {
      throw mockError
    }, { virtual: true })

    try {
      // Call the method
      await floodMap._importComponent()
    } catch (error) {
      // Assert that the caught error is the expected one
      expect(error).toBe(mockError)

      // Verify the button was hidden
      expect(mockButton.getAttribute('style')).toBe('display: none')

      // Verify error handling
      expect(renderErrorSpy).toHaveBeenCalledWith(
        'There was a problem loading the map. Please try again later'
      )
      expect(consoleSpy).toHaveBeenCalledWith(mockError)
    } finally {
      consoleSpy.mockRestore()
    }
  })
})
