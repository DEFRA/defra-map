import React from 'react'
import { render, act } from '@testing-library/react'
import { AppProvider, AppContext } from './AppProvider.jsx'
import { createMockRegistries } from '../__test-helpers__/mockRegistries.js'
import * as mediaHook from '../hooks/useMediaQueryDispatch.js'
import * as detectBreakpoint from '../../utils/detectBreakpoint.js'
import * as detectInterface from '../../utils/detectInterfaceType.js'

jest.mock('../hooks/useMediaQueryDispatch.js')
jest.mock('../../utils/detectBreakpoint.js')
jest.mock('../../utils/detectInterfaceType.js')

describe('AppProvider', () => {
  let handleBreakpointChange, handleInterfaceChange
  let capturedSetMode, capturedRevertMode
  let mockOptions

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }))
    })
  })

  beforeEach(() => {
    const registries = createMockRegistries({
      panelConfig: { panel1: {} },
      buttonConfig: { save: { label: 'Save' } }
    })

    capturedSetMode = null
    capturedRevertMode = null
    const mockEventBus = {
      on: jest.fn((event, handler) => {
        if (event === 'app:setmode') capturedSetMode = handler
        if (event === 'app:revertmode') capturedRevertMode = handler
      }),
      off: jest.fn()
    }

    mockOptions = {
      ...registries,
      eventBus: mockEventBus
    }

    mediaHook.useMediaQueryDispatch.mockImplementation(() => {})

    handleBreakpointChange = jest.fn()
    handleInterfaceChange = jest.fn()
    detectBreakpoint.subscribeToBreakpointChange.mockImplementation(() => handleBreakpointChange)
    detectInterface.subscribeToInterfaceChanges.mockImplementation(() => handleInterfaceChange)
  })

  test('renders children and calls config hooks', () => {
    const { getByText } = render(
      <AppProvider options={mockOptions}>
        <div>ChildContent</div>
      </AppProvider>
    )
    expect(getByText('ChildContent')).toBeInTheDocument()
    expect(mockOptions.panelRegistry.getPanelConfig).toHaveBeenCalled()
    expect(mockOptions.buttonRegistry.getButtonConfig).toHaveBeenCalled()
    expect(mediaHook.useMediaQueryDispatch).toHaveBeenCalled()
  })

  test('handles breakpoint and interface callbacks', () => {
    let breakpointCb, interfaceCb
    detectBreakpoint.subscribeToBreakpointChange.mockImplementation(cb => { breakpointCb = cb; return jest.fn() })
    detectInterface.subscribeToInterfaceChanges.mockImplementation(cb => { interfaceCb = cb; return jest.fn() })

    render(<AppProvider options={mockOptions}><div>Child</div></AppProvider>)

    act(() => {
      breakpointCb('sm')
      interfaceCb('mobile')
    })
  })

  test('handles eventBus setmode and revertmode', () => {
    render(<AppProvider options={mockOptions}><div>Child</div></AppProvider>)
    act(() => {
      capturedSetMode('newMode')
      capturedRevertMode()
    })
    act(() => {
      mockOptions.eventBus.off('app:setmode', capturedSetMode)
      mockOptions.eventBus.off('app:revertmode', capturedRevertMode)
    })
  })

  test('provides state, dispatch, and layoutRefs via context', () => {
    let contextValue
    render(
      <AppProvider options={mockOptions}>
        <AppContext.Consumer>
          {value => { contextValue = value; return null }}
        </AppContext.Consumer>
      </AppProvider>
    )

    expect(contextValue).toHaveProperty('dispatch')
    expect(contextValue).toHaveProperty('mode')
    expect(contextValue).toHaveProperty('openPanels')
    expect(contextValue.layoutRefs).toHaveProperty('mainRef')
    expect(contextValue.layoutRefs).toHaveProperty('footerRef')
  })
})
