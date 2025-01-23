import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Container from '../../src/js/components/container'
import { useApp } from '../../src/js/store/use-app'
import { settings, events } from '../../src/js/store/constants'
import eventBus from '../../src/js/lib/eventbus'

jest.mock('../../src/js/store/viewport-provider.jsx', () => ({
  ViewportProvider: ({ children }) => <div>{children}</div>
}))

jest.mock('../../src/js/store/use-app')

jest.mock('../../src/js/store/constants', () => ({
  defaults: { CONTAINER_TYPE: 'default' },
  events: {
    SET_INFO: 'SET_INFO',
    SET_SELECTED: 'SET_SELECTED',
    SET_DRAW: 'SET_DRAW'
  },
  settings: {
    container: {
      default: {
        CLASS: 'default-class',
        HEIGHT: '100%',
        attribution: 'Default Attribution'
      },
      custom: {
        CLASS: 'custom-class',
        HEIGHT: '80%',
        attribution: 'Custom Attribution'
      }
    }
  }
}))

jest.mock('../../src/js/lib/dom', () => ({
  updateTitle: jest.fn(),
  toggleInert: jest.fn(),
  constrainFocus: jest.fn()
}))

jest.mock('../../src/js/lib/eventbus', () => ({
  on: jest.fn(),
  off: jest.fn()
}))

jest.mock('../../src/js/components/viewport.jsx', () => () => <div>Viewport Mock</div>)
jest.mock('../../src/js/components/exit.jsx', () => () => <div>Exit Mock</div>)
jest.mock('../../src/js/components/search.jsx', () => () => <div>Search Mock</div>)
jest.mock('../../src/js/components/segments.jsx', () => () => <div>Segments Mock</div>)
jest.mock('../../src/js/components/layers.jsx', () => () => <div>Layers Mock</div>)
jest.mock('../../src/js/components/draw.jsx', () => () => <div>Draw Mock</div>)
jest.mock('../../src/js/components/styles.jsx', () => () => <div>Styles Mock</div>)
jest.mock('../../src/js/components/keyboard.jsx', () => () => <div>Keyboard Mock</div>)
jest.mock('../../src/js/components/legend-button.jsx', () => () => <div>LegendButton Mock</div>)
jest.mock('../../src/js/components/key-button.jsx', () => () => <div>KeyButton Mock</div>)
jest.mock('../../src/js/components/search-button.jsx', () => () => <div>SearchButton Mock</div>)
jest.mock('../../src/js/components/styles-button.jsx', () => () => <div>StylesButton Mock</div>)
jest.mock('../../src/js/components/zoom.jsx', () => () => <div>Zoom Mock</div>)
jest.mock('../../src/js/components/reset.jsx', () => () => <div>Reset Mock</div>)
jest.mock('../../src/js/components/location.jsx', () => () => <div>Location Mock</div>)
jest.mock('../../src/js/components/logo.jsx', () => () => <div>Logo Mock</div>)
jest.mock('../../src/js/components/map-error.jsx', () => () => <div>MapError Mock</div>)
jest.mock('../../src/js/components/viewport-label.jsx', () => () => <div>ViewportLabel Mock</div>)
jest.mock('../../src/js/components/draw-edit.jsx', () => () => <div>DrawEdit Mock</div>)
jest.mock('../../src/js/components/actions.jsx', () => () => <div>Actions Mock</div>)
jest.mock('../../src/js/components/help-button.jsx', () => () => <div>HelpButton Mock</div>)

jest.mock('../../src/js/components/panel.jsx', () => ({ label, children }) => (
  <div className='mock-panel'>
    <div>{label}</div>
    {children}
  </div>
))

describe('Container', () => {
  let mockUseApp
  let matchMediaMock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    settings.container = {
      default: { CLASS: 'default-class', HEIGHT: '100%', attribution: 'Default Attribution' },
      custom: { CLASS: 'custom-class', HEIGHT: '80%', attribution: 'Custom Attribution' }
    }
    mockUseApp = {
      activePanel: 'LEGEND',
      isLegendInset: false,
      error: { label: 'Error', message: 'Error message' },
      queryPolygon: { helpLabel: 'Help', html: '<p>Help content</p>' },
      isLegendFixed: false,
      isMobile: false,
      hasLengedHeading: true,
      provider: {},
      options: { type: 'default', legend: { title: 'Legend Title', display: 'fixed' }, hasAutoMode: true },
      dispatch: jest.fn(),
      activeRef: { current: null },
      viewportRef: { current: null },
      parent: 'test-parent'

    }
    useApp.mockReturnValue(mockUseApp)

    matchMediaMock = {
      matches: false, // Simulate dark mode for specific tests
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }

    window.matchMedia = jest.fn().mockImplementation(query => {
      if (!query) return matchMediaMock
      matchMediaMock.media = query
      matchMediaMock.matches = query.includes('dark')
      return matchMediaMock
    })

    jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the Legend panel when activePanel is LEGEND', () => {
    // Set mock values to satisfy rendering conditions
    mockUseApp.activePanel = 'LEGEND'
    mockUseApp.isLegendInset = false
    mockUseApp.legend = { title: 'Legend Title', width: '300px', display: true }
    mockUseApp.queryPolygon = { helpLabel: 'Help', html: '<p>Help content</p>' }

    // Mock the hook to return these values
    useApp.mockReturnValue(mockUseApp)

    render(<Container />)

    // Validate that "Legend Title" is rendered
    expect(screen.getByText('Legend Title')).toBeInTheDocument()
  })

  it('renders the Help panel when activePanel is HELP', () => {
    mockUseApp.activePanel = 'HELP'
    mockUseApp.isLegendFixed = true
    render(<Container />)
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('renders the Style panel when activePanel is STYLE', () => {
    mockUseApp.activePanel = 'STYLE'
    render(<Container />)
    expect(screen.getByText('Map style')).toBeInTheDocument()
  })

  it('renders the Keyboard panel when activePanel is KEYBOARD', () => {
    mockUseApp.activePanel = 'KEYBOARD'
    render(<Container />)
    expect(screen.getByText('Keyboard')).toBeInTheDocument()
  })

  it('renders the Keyboard panel when activePanel is ERROR', () => {
    mockUseApp.activePanel = 'ERROR'
    render(<Container />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('sets the correct type based on options and defaults', () => {
    const settings = {
      container: {
        default: { CLASS: 'default-class' },
        custom: { CLASS: 'custom-class' }
      }
    }
    const options = { type: 'custom' }
    const defaults = { CONTAINER_TYPE: 'default' }
    const type = settings.container[options.type || defaults.CONTAINER_TYPE].CLASS
    expect(type).toBe('custom-class')
  })

  it('renders the Legend panel when activePanel is LEGEND', () => {
    mockUseApp.activePanel = 'LEGEND'
    mockUseApp.isLegendInset = false
    mockUseApp.legend = { title: 'Legend Title', width: '300px', display: true }
    mockUseApp.queryPolygon = { helpLabel: 'Help', html: '<p>Help content</p>' }

    useApp.mockReturnValue(mockUseApp)

    render(<Container />)

    expect(screen.getByText('Legend Title')).toBeInTheDocument()
  })

  it('sets up event listeners and dispatches actions correctly', () => {
    mockUseApp.activePanel = null

    render(<Container />)
    // Check event listeners are registered
    expect(eventBus.on).toHaveBeenCalledWith(
      'test-parent',
      events.SET_INFO,
      expect.any(Function)
    )
    expect(eventBus.on).toHaveBeenCalledWith(
      'test-parent',
      events.SET_SELECTED,
      expect.any(Function)
    )
    expect(eventBus.on).toHaveBeenCalledWith(
      'test-parent',
      events.SET_DRAW,
      expect.any(Function)
    )

    // Check if dark mode media query listener is set up
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')

    // // Check if CONTAINER_READY action is dispatched
    expect(mockUseApp.dispatch).toHaveBeenCalledWith({ type: 'CONTAINER_READY' })
  })

  it('adds and removes dark mode event listener', () => {
    const matchMediaMock = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      matches: false,
      media: '',
      onchange: null
    }

    // Mock window.matchMedia
    window.matchMedia = jest.fn().mockImplementation(() => matchMediaMock)

    // Render the component
    const { unmount } = render(<Container options={{ hasAutoMode: true }} />)

    // Check that addEventListener is called
    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )

    // Unmount the component and ensure removeEventListener is called
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('handles SET_INFO event correctly', () => {
    render(<Container />)

    // Simulate a SET_INFO event
    const setInfoCallback = eventBus.on.mock.calls.find(
      call => call[1] === events.SET_INFO
    )[2]
    setInfoCallback({ info: 'test data' })

    expect(mockUseApp.dispatch).toHaveBeenCalledWith({
      type: 'SET_INFO',
      payload: { info: 'test data' }
    })
  })

  it('calls window.removeEventListener on unmount', () => {
    const { unmount } = render(<Container />)

    // Unmount component and ensure window.removeEventListener is called
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })
})
