import historyManager from './historyManager.js'
import * as queryString from '../utils/queryString.js'

jest.mock('../utils/queryString.js')

describe('historyManager', () => {
  let component1, component2, popstateEvent, mockBreakpointDetector1, mockBreakpointDetector2

  beforeEach(() => {
    mockBreakpointDetector1 = {
      getBreakpoint: jest.fn(() => 'desktop'),
      subscribe: jest.fn(),
      destroy: jest.fn()
    }
    mockBreakpointDetector2 = {
      getBreakpoint: jest.fn(() => 'desktop'),
      subscribe: jest.fn(),
      destroy: jest.fn()
    }
    component1 = {
      id: 'map',
      config: { behaviour: 'buttonFirst' },
      rootEl: document.createElement('div'),
      _breakpointDetector: mockBreakpointDetector1,
      loadApp: jest.fn(),
      removeApp: jest.fn(),
      openButton: { focus: jest.fn() }
    }
    component2 = {
      id: 'list',
      config: { behaviour: 'hybrid' },
      rootEl: document.createElement('div'),
      _breakpointDetector: mockBreakpointDetector2,
      loadApp: jest.fn(),
      removeApp: jest.fn(),
      openButton: { focus: jest.fn() }
    }
    popstateEvent = new PopStateEvent('popstate')
    jest.clearAllMocks()
  })

  it('registers component and initializes popstate listener on first registration', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

    historyManager.register(component1)

    expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function))
    addEventListenerSpy.mockRestore()
  })

  it('loads component when view param matches and component is not open', () => {
    historyManager.register(component1)
    queryString.getQueryParam.mockReturnValue('map')
    mockBreakpointDetector1.getBreakpoint.mockReturnValue('desktop')

    window.dispatchEvent(popstateEvent)

    expect(component1.loadApp).toHaveBeenCalled()
  })

  it('does not load component when already open', () => {
    component1.rootEl.appendChild(document.createElement('div'))
    historyManager.register(component1)
    queryString.getQueryParam.mockReturnValue('map')
    mockBreakpointDetector1.getBreakpoint.mockReturnValue('desktop')

    window.dispatchEvent(popstateEvent)

    expect(component1.loadApp).not.toHaveBeenCalled()
  })

  it('removes component and focuses button when view param does not match', () => {
    component1.rootEl.appendChild(document.createElement('div'))
    historyManager.register(component1)
    queryString.getQueryParam.mockReturnValue(null)
    mockBreakpointDetector1.getBreakpoint.mockReturnValue('desktop')

    window.dispatchEvent(popstateEvent)

    expect(component1.removeApp).toHaveBeenCalled()
    expect(component1.openButton.focus).toHaveBeenCalled()
  })

  it('does not remove hybrid component on non-mobile breakpoint', () => {
    component2.rootEl.appendChild(document.createElement('div'))
    historyManager.register(component2)
    queryString.getQueryParam.mockReturnValue(null)
    mockBreakpointDetector2.getBreakpoint.mockReturnValue('desktop')

    window.dispatchEvent(popstateEvent)

    expect(component2.removeApp).not.toHaveBeenCalled()
  })

  it('removes hybrid component on mobile breakpoint when view does not match', () => {
    component2.rootEl.appendChild(document.createElement('div'))
    historyManager.register(component2)
    queryString.getQueryParam.mockReturnValue(null)
    mockBreakpointDetector2.getBreakpoint.mockReturnValue('mobile')

    window.dispatchEvent(popstateEvent)

    expect(component2.removeApp).toHaveBeenCalled()
  })

  it('unregisters component', () => {
    historyManager.register(component1)
    component1.rootEl.appendChild(document.createElement('div'))
    historyManager.unregister(component1)

    queryString.getQueryParam.mockReturnValue('map')
    mockBreakpointDetector1.getBreakpoint.mockReturnValue('desktop')
    window.dispatchEvent(popstateEvent)

    expect(component1.loadApp).not.toHaveBeenCalled()
  })
})
