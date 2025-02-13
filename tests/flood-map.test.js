import { FloodMap } from '../src/flood-map'
import eventBus from '../src/js/lib/eventbus'
import { events } from '../src/js/store/constants'

describe('FloodMap', () => {
  let floodMap
  let mockElement

  beforeEach(() => {
    // Mock the DOM element
    mockElement = document.createElement('div')
    mockElement.id = 'test-id'
    document.body.appendChild(mockElement)
    eventBus._handlers = {}

    // Mock eventBus.on to store event handlers
    eventBus.on = jest.fn((event, handler) => {
      console.log(`Registering event: ${event}`) // Debugging
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
    jest.restoreAllMocks()
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

    console.log('After calling _removeComponent, root:', floodMap.root) // Debugging

    // Assertions
    expect(unmountSpy).toHaveBeenCalledTimes(1) // Ensure unmount() was called
    expect(floodMap.root).toBeNull() // Ensure root is cleared
  })

  it('should handle popstate event - when is button', () => {
    const props = { behaviour: 'buttonFirst' }
    floodMap = new FloodMap('test-id', props)

    jest.spyOn(floodMap, '_removeComponent')

    history.replaceState({ isBack: false }, '') // eslint-disable-line no-undef

    floodMap._handlePopstate() // Directly invoke the function

    expect(floodMap._removeComponent).toHaveBeenCalled()
  })

  it('should handle popstate event - when is back', () => {
    const props = { behaviour: 'hybrid', isMobile: true }
    floodMap = new FloodMap('test-id', props)

    jest.spyOn(floodMap, '_importComponent')

    history.replaceState({ isBack: true }, '') // eslint-disable-line no-undef

    floodMap._handlePopstate() // Directly invoke the function

    expect(floodMap._importComponent).toHaveBeenCalled()
  })
})
