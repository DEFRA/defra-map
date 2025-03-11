import { FloodMap } from '../src/flood-map'
import eventBus from '../src/js/lib/eventbus'
import { events } from '../src/js/store/constants'

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
        this.root.unmount()
        this.root = null
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
    jest.clearAllMocks()
  })

  it('should initialize with given id and props', () => {
    const props = {}
    floodMap = new FloodMap('test-id', props)

    expect(floodMap.el).toBe(mockElement)
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

  it('should add focus-visible class when keyboard interface is used', () => {
    // Create a div element with the ID 'test-div'
    const div = document.createElement('div')
    div.id = 'test-div'
    div.setAttribute('tabindex', '0')
    document.body.appendChild(div)

    // Create FloodMap instance
    floodMap = new FloodMap('test-id', {})

    // First trigger keyboard interaction with Tab key
    const keydownEvent = new Event('keydown')
    Object.defineProperty(keydownEvent, 'key', { value: 'Tab' })
    window.dispatchEvent(keydownEvent)

    // Verify keyboard interface is set
    expect(floodMap.interfaceType).toBe('keyboard')

    // Mock document.activeElement
    Object.defineProperty(document, 'activeElement', {
      get: () => div,
      configurable: true
    })

    // Now trigger the focus event
    const focusInEvent = new Event('focusin', {
      bubbles: true,
      cancelable: true
    })

    window.dispatchEvent(focusInEvent)

    // Verify the correct class was added
    expect(div.classList.contains('fm-u-focus-visible')).toBe(true)

    // Cleanup
    document.body.removeChild(div)
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
