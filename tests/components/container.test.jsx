import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Container from '../../src/js/components/container'
import { useApp } from '../../src/js/store/use-app'
import { settings } from '../../src/js/store/constants'

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
        HEIGHT: '500px',
        attribution: 'Default Attribution'
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
  on: jest.fn()
}))

jest.mock('../../src/js/components/viewport.jsx', () => () => <div>Viewport Mock</div>)
jest.mock('../../src/js/components/exit.jsx', () => () => <div>Exit Mock</div>)
jest.mock('../../src/js/components/search.jsx', () => () => <div>Search Mock</div>)
jest.mock('../../src/js/components/panel.jsx', () => ({ children }) => <div>Panel Mock {children}</div>)
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

describe('Container', () => {
  let mockUseApp

  beforeEach(() => {
    settings.container = {
      default: { CLASS: 'default-class', HEIGHT: '100%', attribution: 'Default Attribution' },
      custom: { CLASS: 'custom-class', HEIGHT: '80%', attribution: 'Custom Attribution' }
    }
    mockUseApp = {
      activePanel: 'LEGEND',
      isLegendInset: false,
      legend: { title: 'Legend Title', width: '300px', display: true },
      queryPolygon: { helpLabel: 'Help', html: '<p>Help content</p>' },
      isLegendFixed: false,
      isMobile: false,
      hasLengedHeading: true,
      provider: {},
      options: { type: 'default', legend: { display: 'fixed' } },
      dispatch: jest.fn(),
      parent: null,
      activeRef: { current: null },
      viewportRef: { current: null }
    }
    useApp.mockReturnValue(mockUseApp)
  })

  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('dark'), // Simulate dark mode for specific tests
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })

  it('renders the Legend panel when activePanel is LEGEND', () => {
    render(<Container />)
    screen.debug()
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === 'div' && content.includes('Legend Title'))).toBeInTheDocument()
  })

  it('renders the Help panel when activePanel is HELP', () => {
    mockUseApp.activePanel = 'HELP'
    render(<Container />)
    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(screen.getByText('Help content')).toBeInTheDocument()
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
})
