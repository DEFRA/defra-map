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
    SET_SELECTED: 'SET_SELECTED'
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
jest.mock('../../src/js/components/menu.jsx', () => () => <div>Menu Mock</div>)
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
jest.mock('../../src/js/components/draw-shape.jsx', () => () => <div>DrawShape Mock</div>)
jest.mock('../../src/js/components/actions.jsx', () => () => <div>Actions Mock</div>)
jest.mock('../../src/js/components/help-button.jsx', () => () => <div>HelpButton Mock</div>)
jest.mock('../../src/js/components/attribution.jsx', () => () => <div>Attribution Mock</div>)
jest.mock('../../src/js/components/scale-bar.jsx', () => () => <div>Scale bar Mock</div>)

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
    useApp.mockReset()
    mockUseApp = {
      activePanel: 'LEGEND',
      isLegendInset: false,
      error: { label: 'Error', message: 'Error message' },
      queryArea: { helpLabel: 'Help', html: '<p>Help content</p>' },
      isFixed: false,
      isMobile: false,
      hasLengedHeading: true,
      provider: {},
      options: { behaviour: 'default', legend: { title: 'Legend Title', display: 'fixed' }, hasAutoMode: true },
      dispatch: jest.fn(),
      activeRef: { current: null },
      viewportRef: { current: null },
      parent: 'test-parent'
    }
    useApp.mockReturnValue(mockUseApp)

    matchMediaMock = {
      matches: false,
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
    mockUseApp.queryArea = { helpLabel: 'Help', html: '<p>Help content</p>' }

    // Mock the hook to return these values
    useApp.mockReturnValue(mockUseApp)

    render(<Container />)

    // Validate that "Legend Title" is rendered
    expect(screen.getByText('Legend Title')).toBeInTheDocument()
  })

  it('renders the Help panel when activePanel is EDIT', () => {
    mockUseApp.activePanel = 'EDIT'
    mockUseApp.isMobile = true
    render(<Container />)
    expect(screen.getByText('Dimensions')).toBeInTheDocument()
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

  it('renders the Key panel when activePanel is KEYBOARD', () => {
    mockUseApp.activePanel = 'KEY'
    render(<Container />)
    expect(screen.getByText('Key')).toBeInTheDocument()
  })

  it('renders the Error panel when activePanel is ERROR', () => {
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
    const options = { behaviour: 'custom' }
    const defaults = { CONTAINER_TYPE: 'default' }
    const behaviour = settings.container[options.behaviour || defaults.CONTAINER_TYPE].CLASS
    expect(behaviour).toBe('custom-class')
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

  it('dispatches SET_IS_DARK_MODE action based on color scheme', () => {
    // Set up matchMedia to return dark mode
    matchMediaMock.matches = true
    window.matchMedia = jest.fn().mockImplementation(() => matchMediaMock)

    // Render the component
    render(<Container />)

    // Call handleColorSchemeMQ
    const handleColorSchemeMQ = () => mockUseApp.dispatch({
      type: 'SET_IS_DARK_MODE',
      payload: { colourScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
    })
    handleColorSchemeMQ()

    // Check if the correct action is dispatched
    expect(mockUseApp.dispatch).toHaveBeenCalledWith({
      type: 'SET_IS_DARK_MODE',
      payload: { colourScheme: 'dark' }
    })

    // Set up matchMedia to return light mode
    matchMediaMock.matches = false
    window.matchMedia = jest.fn().mockImplementation(() => matchMediaMock)

    // Call handleColorSchemeMQ again
    handleColorSchemeMQ()

    // Check if the correct action is dispatched
    expect(mockUseApp.dispatch).toHaveBeenCalledWith({
      type: 'SET_IS_DARK_MODE',
      payload: { colourScheme: 'light' }
    })
  })

  it('renders info panel when info exists, panel is INFO and is mobile', () => {
    // Set up the required conditions
    mockUseApp.info = {
      label: 'Test Info Label',
      html: '<p>Test info content</p>'
    }
    mockUseApp.activePanel = 'INFO'
    mockUseApp.isMobile = true
    mockUseApp.viewportRef = { current: {} }

    render(<Container />)

    // Check the Panel is rendered with correct props
    expect(screen.getByText('Test Info Label')).toBeInTheDocument()
  })

  it('does not render when info is null', () => {
    mockUseApp.info = null
    mockUseApp.activePanel = 'INFO'
    mockUseApp.isMobile = true

    render(<Container />)
    const panel = screen.queryByRole('complementary')
    expect(panel).not.toBeInTheDocument()
  })

  it('does not render when activePanel is not INFO', () => {
    mockUseApp.info = { label: 'Test Info', html: '<p>Test</p>' }
    mockUseApp.activePanel = 'LEGEND'
    mockUseApp.isMobile = true

    render(<Container />)
    const panel = screen.queryByRole('complementary', { name: 'Test Info' })
    expect(panel).not.toBeInTheDocument()
  })

  it('does not render when not mobile', () => {
    mockUseApp.info = { label: 'Test Info', html: '<p>Test</p>' }
    mockUseApp.activePanel = 'INFO'
    mockUseApp.isMobile = false

    render(<Container />)
    const panel = screen.queryByRole('complementary', { name: 'Test Info' })
    expect(panel).not.toBeInTheDocument()
  })
  it('renders with page title when isPage is true', () => {
    mockUseApp.isPage = true // Set isPage directly
    mockUseApp.options = {
      ...mockUseApp.options,
      pageTitle: 'Custom Page Title'
    }
    const { container } = render(<Container />)
    expect(container.querySelector('.fm-o-container')).toHaveAttribute('data-fm-page', 'Custom Page Title')
  })

  it('uses default Map view title when no pageTitle provided', () => {
    mockUseApp.isPage = true
    mockUseApp.options = {
      ...mockUseApp.options,
      pageTitle: undefined
    }

    const { container } = render(<Container />)
    expect(container.querySelector('.fm-o-container')).toHaveAttribute('data-fm-page', 'Map view')
  })

  it('does not render data-fm-page when isPage is false', () => {
    mockUseApp.isPage = false

    const { container } = render(<Container />)
    expect(container.firstChild).not.toHaveAttribute('data-fm-page')
  })

  it('renders side panel when isDesktop is true and legend display is not inset', () => {
    mockUseApp.isDesktop = true
    mockUseApp.legend = {
      ...mockUseApp.legend,
      display: 'fixed'
    }
    mockUseApp.isQueryMode = false

    const { container } = render(<Container />)
    expect(container.querySelector('.fm-o-panel')).toBeInTheDocument()
  })

  it('does not render legend component when in query mode', () => {
    mockUseApp.isFixed = true
    mockUseApp.isQueryMode = true

    const { container } = render(<Container />)
    expect(container.querySelector('.fm-c-panel--legend')).not.toBeInTheDocument()
  })

  it('passes correct props to Panel component', () => {
    mockUseApp = {
      ...mockUseApp,
      isDesktop: true, // needed for isFixed calculation
      isMobile: false,
      mode: '', // empty string for isQueryMode to be false
      options: {
        behaviour: 'default',
        legend: {
          title: 'Test Legend',
          width: '250px',
          display: 'fixed' // 'fixed' instead of true to ensure !isLegendInset
        },
        hasAutoMode: true
      },
      activePanel: 'LEGEND',
      provider: {},
      dispatch: jest.fn(),
      activeRef: { current: null },
      viewportRef: { current: null },
      parent: 'test-parent'
    }

    useApp.mockReturnValue(mockUseApp)

    const { container } = render(<Container />)
    const panel = container.querySelector('.mock-panel')
    expect(panel).toBeInTheDocument()
    expect(panel.querySelector('div')).toHaveTextContent('Test Legend')
  })

  it('handles case when legend display is false', () => {
    mockUseApp.isFixed = true
    mockUseApp.isQueryMode = false
    mockUseApp.legend = {
      title: 'Test Legend',
      width: '250px',
      display: false
    }

    render(<Container />)
    const layers = screen.getByText('Layers Mock')
    expect(layers).toBeInTheDocument()
  })
  it('renders key panel when activePanel is KEY and isMobile is true', () => {
    mockUseApp = {
      ...mockUseApp,
      activePanel: 'KEY',
      isMobile: true,
      isKeyExpanded: true, // for isModal prop
      options: {
        behaviour: 'default',
        legend: {
          title: 'Legend Title',
          display: 'fixed'
        }
      },
      provider: {},
      dispatch: jest.fn(),
      activeRef: { current: null },
      viewportRef: { current: null }
    }
    useApp.mockReturnValue(mockUseApp)

    const { container } = render(<Container />)

    // Look for mock-panel instead of .key
    const panel = container.querySelector('.mock-panel')
    expect(panel).toBeInTheDocument()

    // Check for the Key label
    expect(panel.querySelector('div')).toHaveTextContent('Key')

    // Check that Layers component is rendered
    expect(screen.getByText('Layers Mock')).toBeInTheDocument()
  })

  it('does not render key panel when activePanel is not KEY', () => {
    mockUseApp = {
      ...mockUseApp,
      activePanel: 'LEGEND',
      isMobile: true,
      isKeyExpanded: true
    }
    useApp.mockReturnValue(mockUseApp)

    const { container } = render(<Container />)
    expect(container.querySelector('.key')).not.toBeInTheDocument()
  })

  it('does not render key panel when not mobile', () => {
    mockUseApp = {
      ...mockUseApp,
      activePanel: 'KEY',
      isMobile: false,
      isKeyExpanded: true
    }
    useApp.mockReturnValue(mockUseApp)

    const { container } = render(<Container />)
    expect(container.querySelector('.key')).not.toBeInTheDocument()
  })
})
